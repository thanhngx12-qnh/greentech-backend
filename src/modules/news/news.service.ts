// File: src/modules/news/news.service.ts
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class NewsService {
  constructor(private prisma: PrismaService) {}

  // --- ADMIN METHODS ---

  async create(dto: CreateNewsDto) {
    try {
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
      this.prisma.news.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { [sortBy]: order.toLowerCase() as 'asc' | 'desc' },
      }),
      this.prisma.news.count({ where }),
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
    const news = await this.prisma.news.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!news) throw new NotFoundException('Không tìm thấy bài viết');
    return news;
  }

  async update(id: string, dto: UpdateNewsDto) {
    const existing = await this.findOne(id);
    const updateData: Prisma.NewsUpdateInput = {};

    if (dto.status) updateData.status = dto.status;
    if (dto.featured_image) updateData.featured_image = dto.featured_image;
    if (dto.category_id)
      updateData.category = { connect: { id: dto.category_id } };

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

    if (dto.seo_i18n) {
      updateData.seo_i18n = dto.seo_i18n as any;
    }

    return this.prisma.news.update({ where: { id }, data: updateData as any });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.news.delete({ where: { id } });
  }

  // --- PUBLIC METHODS ---

  async findBySlug(slug: string, lang: string) {
    const news = await this.prisma.news.findFirst({
      where: {
        status: 'PUBLISHED',
        slug_i18n: {
          path: [lang],
          equals: slug,
        } as any,
      },
      include: { category: true },
    });

    if (!news) throw new NotFoundException('Không tìm thấy bài viết');
    return news;
  }
}
