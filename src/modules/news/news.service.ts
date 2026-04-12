// File: src/modules/news/news.service.ts
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class NewsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateNewsDto) {
    // 1. KIỂM TRA LOẠI CATEGORY (Giải quyết vấn đề bạn lo lắng)
    const category = await this.prisma.category.findUnique({
      where: { id: dto.category_id },
    });

    if (!category) {
      // Tạo một lỗi tùy chỉnh với errorCode
      const error: any = new NotFoundException('Danh mục không tồn tại');
      error.errorCode = 'CATEGORY_NOT_FOUND';
      throw error;
    }

    if (category.type !== 'NEWS') {
      const error: any = new BadRequestException(
        'Danh mục này không dành cho Tin tức',
      );
      error.errorCode = 'INVALID_CATEGORY_TYPE';
      throw error;
    }

    // 2. Chuẩn bị dữ liệu
    const newsData: Prisma.NewsCreateInput = {
      category: { connect: { id: dto.category_id } },
      status: dto.status || 'DRAFT',
      featured_image: dto.featured_image,
      slug_i18n: {
        vi: dto.slug_vi,
        en: dto.slug_en,
        zh: dto.slug_zh,
      },
      title_i18n: {
        vi: dto.title_vi,
        en: dto.title_en,
        zh: dto.title_zh,
      },
      content_i18n: {
        vi: dto.content_vi,
        en: dto.content_en,
        zh: dto.content_zh,
      },
      seo_i18n: dto.seo_i18n as any,
    };

    try {
      return await this.prisma.news.create({ data: newsData });
    } catch (error) {
      console.error('News Create Error:', error);
      throw new InternalServerErrorException('Không thể tạo bài viết');
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

    const where: Prisma.NewsWhereInput = {};
    if (status) where.status = status;

    let [data, total] = await Promise.all([
      this.prisma.news.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { [sortBy]: order.toLowerCase() as 'asc' | 'desc' },
      }),
      this.prisma.news.count({ where }),
    ]);

    if (search) {
      const term = search.toLowerCase();
      data = data.filter((item: any) => {
        const titleVi = item.title_i18n?.vi?.toLowerCase() || '';
        return titleVi.includes(term);
      });
      total = data.length;
    }

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
    const news = await this.prisma.news.findUnique({ where: { id } });
    if (!news) throw new NotFoundException('Không tìm thấy bài viết');
    return news;
  }

  async update(id: string, dto: UpdateNewsDto) {
    // 1. Lấy dữ liệu cũ trước để tránh mất dữ liệu khi update từng phần
    const existing = await this.findOne(id);

    // Ép kiểu dữ liệu cũ sang any để truy cập các key bên trong JSON dễ dàng
    const oldSlug = existing.slug_i18n as any;
    const oldTitle = existing.title_i18n as any;
    const oldContent = existing.content_i18n as any;
    const oldSeo = existing.seo_i18n as any;

    // 2. Chuẩn bị object update
    const updateData: Prisma.NewsUpdateInput = {};

    // Cập nhật các trường cơ bản
    if (dto.status) updateData.status = dto.status;
    if (dto.featured_image) updateData.featured_image = dto.featured_image;
    if (dto.category_id)
      updateData.category = { connect: { id: dto.category_id } };

    // 3. Mapping thông minh: Chỉ cập nhật những gì được gửi lên, giữ lại cái cũ cho các ngôn ngữ khác
    // Cập nhật Slug
    if (dto.slug_vi || dto.slug_en || dto.slug_zh) {
      updateData.slug_i18n = {
        vi: dto.slug_vi ?? oldSlug?.vi,
        en: dto.slug_en ?? oldSlug?.en,
        zh: dto.slug_zh ?? oldSlug?.zh,
      } as any;
    }

    // Cập nhật Title
    if (dto.title_vi || dto.title_en || dto.title_zh) {
      updateData.title_i18n = {
        vi: dto.title_vi ?? oldTitle?.vi,
        en: dto.title_en ?? oldTitle?.en,
        zh: dto.title_zh ?? oldTitle?.zh,
      } as any;
    }

    // Cập nhật Content
    if (dto.content_vi || dto.content_en || dto.content_zh) {
      updateData.content_i18n = {
        vi: dto.content_vi ?? oldContent?.vi,
        en: dto.content_en ?? oldContent?.en,
        zh: dto.content_zh ?? oldContent?.zh,
      } as any;
    }

    // Cập nhật SEO
    if (dto.seo_i18n) {
      updateData.seo_i18n = dto.seo_i18n as any;
    }

    try {
      return await this.prisma.news.update({
        where: { id },
        data: updateData as any,
      });
    } catch (error) {
      console.error('News Update Error:', error);
      throw new InternalServerErrorException('Cập nhật bài viết thất bại');
    }
  }

  async remove(id: string) {
    await this.findOne(id); // Kiểm tra tồn tại trước khi xóa
    return this.prisma.news.delete({ where: { id } });
  }
}
