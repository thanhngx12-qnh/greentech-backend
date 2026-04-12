// File: src/modules/services/services.service.ts
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  // --- ADMIN METHODS ---

  async create(dto: CreateServiceDto, currentUserId: string) {
    // 1. Kiểm tra Category có đúng loại SERVICE không
    const category = await this.prisma.category.findUnique({
      where: { id: dto.category_id },
    });
    if (!category || category.type !== 'SERVICE') {
      throw new BadRequestException({
        errorCode: 'INVALID_CATEGORY',
        message: 'Danh mục không hợp lệ hoặc không phải là Dịch vụ',
      });
    }

    try {
      const serviceData: Prisma.ServiceCreateInput = {
        category: { connect: { id: dto.category_id } },
        // Gán tự động author là người đang login (nếu không được truyền tay)
        author: { connect: { id: dto.author_id || currentUserId } },

        // Dữ liệu thương mại
        price: dto.price,
        currency: dto.currency || 'VND',
        duration: dto.duration,

        status: dto.status || 'DRAFT',
        featured_image: dto.featured_image,

        // Mapping JSONB đa ngôn ngữ
        slug_i18n: { vi: dto.slug_vi, en: dto.slug_en, zh: dto.slug_zh },
        title_i18n: { vi: dto.title_vi, en: dto.title_en, zh: dto.title_zh },
        content_i18n: {
          vi: dto.content_vi,
          en: dto.content_en,
          zh: dto.content_zh,
        },
        seo_i18n: dto.seo_i18n as any,
      };

      return await this.prisma.service.create({ data: serviceData });
    } catch (error) {
      console.error('Service Create Error:', error);
      throw new InternalServerErrorException('Không thể tạo dịch vụ');
    }
  }

  async findAll(query: any) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'created_at',
      order = 'DESC',
      status,
      search,
    } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ServiceWhereInput = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        {
          title_i18n: {
            path: ['vi'],
            string_contains: search,
            mode: 'insensitive',
          } as any,
        },
        {
          title_i18n: {
            path: ['en'],
            string_contains: search,
            mode: 'insensitive',
          } as any,
        },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.service.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { [sortBy]: order.toLowerCase() as 'asc' | 'desc' },
        include: { author: { select: { id: true, full_name: true } } }, // Trả về luôn tên người tạo
      }),
      this.prisma.service.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const service = await this.prisma.service.findUnique({
      where: { id },
      include: {
        category: true,
        author: { select: { id: true, full_name: true, email: true } },
      },
    });
    if (!service) throw new NotFoundException('Không tìm thấy dịch vụ');
    return service;
  }

  async update(id: string, dto: UpdateServiceDto) {
    const existing = await this.findOne(id);
    const updateData: Prisma.ServiceUpdateInput = {};

    // Cập nhật trường vật lý
    if (dto.status) updateData.status = dto.status;
    if (dto.featured_image) updateData.featured_image = dto.featured_image;
    if (dto.category_id)
      updateData.category = { connect: { id: dto.category_id } };
    if (dto.price !== undefined) updateData.price = dto.price;
    if (dto.currency) updateData.currency = dto.currency;
    if (dto.duration) updateData.duration = dto.duration;

    // Merge JSONB
    if (dto.slug_vi || dto.slug_en || dto.slug_zh) {
      updateData.slug_i18n = {
        vi: dto.slug_vi ?? (existing.slug_i18n as any).vi,
        en: dto.slug_en ?? (existing.slug_i18n as any).en,
        zh: dto.slug_zh ?? (existing.slug_i18n as any).zh,
      } as any;
    }
    if (dto.title_vi || dto.title_en || dto.title_zh) {
      updateData.title_i18n = {
        vi: dto.title_vi ?? (existing.title_i18n as any).vi,
        en: dto.title_en ?? (existing.title_i18n as any).en,
        zh: dto.title_zh ?? (existing.title_i18n as any).zh,
      } as any;
    }
    if (dto.content_vi || dto.content_en || dto.content_zh) {
      updateData.content_i18n = {
        vi: dto.content_vi ?? (existing.content_i18n as any).vi,
        en: dto.content_en ?? (existing.content_i18n as any).en,
        zh: dto.content_zh ?? (existing.content_i18n as any).zh,
      } as any;
    }
    if (dto.seo_i18n) updateData.seo_i18n = dto.seo_i18n as any;

    return this.prisma.service.update({
      where: { id },
      data: updateData as any,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    // Áp dụng Soft Delete (ẩn đi thay vì xóa hẳn để bảo vệ dữ liệu kinh doanh)
    return this.prisma.service.update({
      where: { id },
      data: { deleted_at: new Date(), is_active: false },
    });
  }

  // --- PUBLIC METHODS (Cho Website) ---

  async findBySlug(slug: string, lang: string) {
    const service = await this.prisma.service.findFirst({
      where: {
        status: 'PUBLISHED',
        is_active: true,
        deleted_at: null,
        slug_i18n: { path: [lang], equals: slug } as any, // Tìm chính xác theo slug của ngôn ngữ đó
      },
      include: {
        category: true,
        author: { select: { id: true, full_name: true } },
      },
    });

    if (!service)
      throw new NotFoundException(
        'Dịch vụ không tồn tại hoặc đã ngừng cung cấp',
      );

    // MAP DỮ LIỆU CHI TIẾT
    const currentLang = lang as string;
    const titleObj = service.title_i18n as any;
    const contentObj = service.content_i18n as any;
    const seoObj = service.seo_i18n as any;

    return {
      id: service.id,
      category: service.category,
      author: service.author,
      price: service.price,
      currency: service.currency,
      duration: service.duration,
      featured_image: service.featured_image,
      created_at: service.created_at,

      title: titleObj?.[currentLang] || titleObj?.['vi'],
      content: contentObj?.[currentLang] || contentObj?.['vi'],
      seo: seoObj?.[currentLang] || seoObj?.['vi'],
    };
  }

  // ========================================================
  // --- PUBLIC METHODS (Cho Website - Tự động map Đa ngôn ngữ) ---
  // ========================================================

  async findAllPublic(query: any) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'created_at',
      order = 'DESC',
      lang = 'vi',
    } = query;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.service.findMany({
        where: {
          status: 'PUBLISHED',
          is_active: true,
          deleted_at: null,
        },
        skip,
        take: Number(limit),
        orderBy: { [sortBy]: order.toLowerCase() as 'asc' | 'desc' },
        include: { author: { select: { id: true, full_name: true } } },
      }),
      this.prisma.service.count({
        where: { status: 'PUBLISHED', is_active: true, deleted_at: null },
      }),
    ]);

    // MAP DỮ LIỆU: Chỉ trả về ngôn ngữ khách yêu cầu, giấu các ngôn ngữ khác đi cho nhẹ Web
    const currentLang = lang as string;
    const mappedData = data.map((item) => {
      const titleObj = item.title_i18n as any;
      const contentObj = item.content_i18n as any;
      const slugObj = item.slug_i18n as any;
      const seoObj = item.seo_i18n as any;

      return {
        id: item.id,
        category_id: item.category_id,
        author: item.author,
        price: item.price,
        currency: item.currency,
        duration: item.duration,
        featured_image: item.featured_image,
        created_at: item.created_at,

        // Trích xuất đúng ngôn ngữ, nếu ngôn ngữ đó chưa nhập thì lấy tạm tiếng Việt
        title: titleObj?.[currentLang] || titleObj?.['vi'],
        content: contentObj?.[currentLang] || contentObj?.['vi'],
        slug: slugObj?.[currentLang] || slugObj?.['vi'],
        seo: seoObj?.[currentLang] || seoObj?.['vi'],
      };
    });

    return {
      data: mappedData,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
