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
import { AuditLogsService } from '../audit-logs/audit-logs.service'; // <-- THÊM IMPORT AUDIT LOG

@Injectable()
export class ServicesService {
  constructor(
    private prisma: PrismaService,
    private auditLogsService: AuditLogsService, // <-- INJECT AUDIT LOG
  ) {}

  // ========================================================
  // --- ADMIN METHODS ---
  // ========================================================

  async create(dto: CreateServiceDto, currentUserId: string) {
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
        author: { connect: { id: dto.author_id || currentUserId } },

        price: dto.price,
        currency: dto.currency || 'VND',
        duration: dto.duration,
        status: dto.status || 'DRAFT',
        featured_image: dto.featured_image,

        slug_i18n: { vi: dto.slug_vi, en: dto.slug_en, zh: dto.slug_zh },
        title_i18n: { vi: dto.title_vi, en: dto.title_en, zh: dto.title_zh },
        content_i18n: {
          vi: dto.content_vi,
          en: dto.content_en,
          zh: dto.content_zh,
        },
        seo_i18n: dto.seo_i18n as any,
      };

      const newService = await this.prisma.service.create({
        data: serviceData,
      });

      // 🎯 BẮN LOG: Hành động TẠO MỚI (Chạy ngầm)
      this.auditLogsService.logChange(
        currentUserId,
        'CREATE',
        'SERVICES',
        newService.id,
        null,
        serviceData,
      );

      return newService;
    } catch (error) {
      console.error('Service Create Error:', error);
      throw new InternalServerErrorException({
        errorCode: 'CREATE_FAILED',
        message: 'Không thể tạo dịch vụ',
      });
    }
  }

  async findAll(query: any) {
    // Ép kiểu an toàn để tránh lỗi undefined khi tính skip
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const {
      sortBy = 'created_at',
      order = 'DESC',
      status,
      search,
      lang = 'vi',
    } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ServiceWhereInput = { deleted_at: null };
    if (status) where.status = status;

    // ÁP DỤNG HYBRID SEARCH ĐỂ XỬ LÝ TIẾNG VIỆT TRONG JSONB
    let [data, total] = await Promise.all([
      this.prisma.service.findMany({
        where,
        // Nếu có search thì bỏ qua skip/take để lấy hết ra lọc bằng JS, nếu không thì phân trang bình thường
        skip: search ? undefined : skip,
        take: search ? undefined : limit,
        orderBy: { [sortBy]: order.toLowerCase() as 'asc' | 'desc' },
        include: { author: { select: { id: true, full_name: true } } },
      }),
      this.prisma.service.count({ where }),
    ]);

    // Lọc bằng Javascript nếu có từ khóa
    if (search) {
      const term = search.toLowerCase().trim();
      const currentLang = lang as string;
      data = data.filter((item) => {
        const title =
          (item.title_i18n as any)?.[currentLang]?.toLowerCase() || '';
        return title.includes(term);
      });
      total = data.length; // Cập nhật lại tổng số kết quả
      data = data.slice(skip, skip + limit); // Cắt mảng để phân trang
    }

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
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
    if (!service) {
      throw new NotFoundException({
        errorCode: 'SERVICE_NOT_FOUND',
        message: 'Không tìm thấy dịch vụ',
      });
    }
    return service;
  }

  async update(id: string, dto: UpdateServiceDto, currentUserId: string) {
    const existing = await this.findOne(id);
    const updateData: Prisma.ServiceUpdateInput = {};

    if (dto.status) updateData.status = dto.status;
    if (dto.featured_image) updateData.featured_image = dto.featured_image;
    if (dto.category_id)
      updateData.category = { connect: { id: dto.category_id } };
    if (dto.price !== undefined) updateData.price = dto.price;
    if (dto.currency) updateData.currency = dto.currency;
    if (dto.duration) updateData.duration = dto.duration;

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

    try {
      const updatedService = await this.prisma.service.update({
        where: { id },
        data: updateData as any,
      });

      // 🎯 BẮN LOG: Ghi lại hành động CẬP NHẬT
      this.auditLogsService.logChange(
        currentUserId,
        'UPDATE',
        'SERVICES',
        id,
        existing,
        updateData,
      );

      return updatedService;
    } catch (error) {
      throw new InternalServerErrorException({
        errorCode: 'UPDATE_FAILED',
        message: 'Cập nhật dịch vụ thất bại',
      });
    }
  }

  async remove(id: string, currentUserId: string) {
    const existing = await this.findOne(id);
    const deletedService = await this.prisma.service.update({
      where: { id },
      data: { deleted_at: new Date(), is_active: false },
    });

    // 🎯 BẮN LOG: Ghi lại hành động XÓA
    this.auditLogsService.logChange(
      currentUserId,
      'DELETE',
      'SERVICES',
      id,
      existing,
      null,
    );

    return deletedService;
  }

  // ========================================================
  // --- PUBLIC METHODS (Cho Website) ---
  // ========================================================

  async findBySlug(slug: string, lang: string) {
    const service = await this.prisma.service.findFirst({
      where: {
        status: 'PUBLISHED',
        is_active: true,
        deleted_at: null,
        slug_i18n: { path: [lang], equals: slug } as any,
      },
      include: {
        category: true,
        author: { select: { id: true, full_name: true } },
      },
    });

    if (!service) {
      throw new NotFoundException({
        errorCode: 'SERVICE_NOT_FOUND',
        message: 'Dịch vụ không tồn tại hoặc đã ngừng cung cấp',
      });
    }

    const currentLang = lang as string;
    const titleObj = service.title_i18n as any;
    const contentObj = service.content_i18n as any;
    const seoObj = service.seo_i18n as any;
    const slugObj = service.slug_i18n as any;

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
      slug: slugObj?.[currentLang] || slugObj?.['vi'],

      // 🎯 TRẢ VỀ BẢN ĐỒ SLUG CHO FRONTEND ĐỔI NGÔN NGỮ
      available_slugs: slugObj,
    };
  }

  async findAllPublic(query: any) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const { sortBy = 'created_at', order = 'DESC', lang = 'vi' } = query;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.service.findMany({
        where: {
          status: 'PUBLISHED',
          is_active: true,
          deleted_at: null,
        },
        skip,
        take: limit,
        orderBy: { [sortBy]: order.toLowerCase() as 'asc' | 'desc' },
        include: { author: { select: { id: true, full_name: true } } },
      }),
      this.prisma.service.count({
        where: { status: 'PUBLISHED', is_active: true, deleted_at: null },
      }),
    ]);

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

        title: titleObj?.[currentLang] || titleObj?.['vi'],
        content: contentObj?.[currentLang] || contentObj?.['vi'],
        slug: slugObj?.[currentLang] || slugObj?.['vi'],
        seo: seoObj?.[currentLang] || seoObj?.['vi'],
      };
    });

    return {
      data: mappedData,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
