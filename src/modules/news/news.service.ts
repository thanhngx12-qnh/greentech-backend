// File: src/modules/news/news.service.ts
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateNewsDto } from './dto/create-news.dto'; // <-- SỬA LỖI TẠI ĐÂY
import { UpdateNewsDto } from './dto/update-news.dto'; // <-- SỬA LỖI TẠI ĐÂY
import { Prisma, NewsStatus } from '@prisma/client';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class NewsService {
  constructor(
    private prisma: PrismaService,
    private auditLogsService: AuditLogsService, // <-- INJECT
    @InjectQueue('indexing-queue') private indexingQueue: Queue,
  ) {}

  // ========================================================
  // --- ADMIN METHODS ---
  // ========================================================

  async create(dto: CreateNewsDto, currentUserId: string) {
    const category = await this.prisma.category.findUnique({
      where: { id: dto.category_id },
    });
    if (!category || category.type !== 'NEWS') {
      throw new BadRequestException({
        errorCode: 'INVALID_CATEGORY',
        message: 'Danh mục không hợp lệ hoặc không phải là Tin tức',
      });
    }

    try {
      const newsData: Prisma.NewsCreateInput = {
        category: { connect: { id: dto.category_id } },
        author: { connect: { id: currentUserId } },
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

      const newNews = await this.prisma.news.create({ data: newsData });

      if (dto.is_index_request && newNews.status === NewsStatus.PUBLISHED) {
        const slugs = newNews.slug_i18n as any;
        const baseUrl =
          process.env.FRONTEND_BASE_URL || 'http://localhost:3001';
        const urls_to_index = Object.keys(slugs)
          .map((lang) =>
            slugs[lang] ? `${baseUrl}/${lang}/news/${slugs[lang]}` : null,
          )
          .filter(Boolean);

        if (urls_to_index.length > 0) {
          await this.indexingQueue.add('request-indexing', {
            urls: urls_to_index,
          });
          console.log(
            '[INDEXING QUEUE] Đã thêm Job index cho bài viết mới:',
            newNews.id,
          );
        }
      }

      this.auditLogsService.logChange(
        currentUserId,
        'CREATE',
        'NEWS',
        newNews.id,
        null,
        newsData,
      );
      return newNews;
    } catch (error) {
      console.error('News Create Error:', error);
      throw new InternalServerErrorException('Không thể tạo bài viết');
    }
  }

  async findAll(query: any) {
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

    const where: Prisma.NewsWhereInput = { deleted_at: null };
    if (status) where.status = status;

    // 🎯 HYBRID SEARCH CHUẨN TIẾNG VIỆT
    let [data, total] = await Promise.all([
      this.prisma.news.findMany({
        where,
        skip: search ? undefined : skip,
        take: search ? undefined : limit,
        orderBy: { [sortBy]: order.toLowerCase() as 'asc' | 'desc' },
        include: { author: { select: { id: true, full_name: true } } }, // <-- INCLUDE AUTHOR
      }),
      this.prisma.news.count({ where }),
    ]);

    if (search) {
      const term = search.toLowerCase().trim();
      const currentLang = lang as string;
      data = data.filter((item) => {
        const title =
          (item.title_i18n as any)?.[currentLang]?.toLowerCase() || '';
        return title.includes(term);
      });
      total = data.length;
      data = data.slice(skip, skip + limit);
    }

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const news = await this.prisma.news.findUnique({
      where: { id },
      include: {
        category: true,
        author: { select: { id: true, full_name: true, email: true } },
      },
    });
    if (!news) {
      throw new NotFoundException({
        errorCode: 'NEWS_NOT_FOUND',
        message: 'Không tìm thấy bài viết',
      });
    }
    return news;
  }

  async update(id: string, dto: UpdateNewsDto, currentUserId: string) {
    const existing = await this.findOne(id);
    // 🎯 SỬA: Dùng đúng Prisma.NewsUpdateInput
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

    // 🎯 SỬA: Dùng đúng this.prisma.news.update
    const updatedNews = await this.prisma.news.update({
      where: { id },
      data: updateData as any,
    });

    if (dto.is_index_request && updatedNews.status === NewsStatus.PUBLISHED) {
      const slugs = updatedNews.slug_i18n as any;
      const baseUrl = process.env.FRONTEND_BASE_URL || 'http://localhost:3001';
      const urls_to_index = Object.keys(slugs)
        .map((lang) =>
          slugs[lang] ? `${baseUrl}/${lang}/news/${slugs[lang]}` : null,
        )
        .filter(Boolean);

      if (urls_to_index.length > 0) {
        await this.indexingQueue.add('request-indexing', {
          urls: urls_to_index,
        });
        console.log(
          '[INDEXING QUEUE] Đã thêm Job index cho bài viết vừa cập nhật:',
          updatedNews.id,
        );
      }
    }

    this.auditLogsService.logChange(
      currentUserId,
      'UPDATE',
      'NEWS',
      id,
      existing,
      updateData,
    );
    return updatedNews;
  }

  async remove(id: string, currentUserId: string) {
    // <-- THÊM currentUserId
    const existing = await this.findOne(id);

    // 🎯 XÓA MỀM (Soft Delete)
    const deletedNews = await this.prisma.news.update({
      where: { id },
      data: { deleted_at: new Date() },
    });

    // 🎯 BẮN LOG
    this.auditLogsService.logChange(
      currentUserId,
      'DELETE',
      'NEWS',
      id,
      existing,
      null,
    );

    return deletedNews;
  }

  // ========================================================
  // --- PUBLIC METHODS (Cho Website) ---
  // ========================================================

  async findBySlug(slug: string, lang: string) {
    const news = await this.prisma.news.findFirst({
      where: {
        status: 'PUBLISHED',
        deleted_at: null,
        slug_i18n: { path: [lang], equals: slug } as any,
      },
      include: {
        category: true,
        author: { select: { id: true, full_name: true } },
      },
    });

    if (!news) {
      throw new NotFoundException({
        errorCode: 'NEWS_NOT_FOUND',
        message: 'Không tìm thấy bài viết',
      });
    }

    const currentLang = lang as string;
    const titleObj = news.title_i18n as any;
    const contentObj = news.content_i18n as any;
    const seoObj = news.seo_i18n as any;
    const slugObj = news.slug_i18n as any;

    return {
      id: news.id,
      category: news.category,
      author: news.author,
      featured_image: news.featured_image,
      created_at: news.created_at,

      title: titleObj?.[currentLang] || titleObj?.['vi'],
      content: contentObj?.[currentLang] || contentObj?.['vi'],
      seo: seoObj?.[currentLang] || seoObj?.['vi'],
      slug: slugObj?.[currentLang] || slugObj?.['vi'],

      available_slugs: slugObj, // 🎯 BẢN ĐỒ SLUG CHO FRONTEND
    };
  }

  // 🎯 HÀM MỚI: BÓC TÁCH DỮ LIỆU ĐA NGÔN NGỮ CHO DANH SÁCH PUBLIC
  async findAllPublic(query: any) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const { sortBy = 'created_at', order = 'DESC', lang = 'vi' } = query;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.news.findMany({
        where: { status: 'PUBLISHED', deleted_at: null },
        skip,
        take: limit,
        orderBy: { [sortBy]: order.toLowerCase() as 'asc' | 'desc' },
        include: { author: { select: { id: true, full_name: true } } },
      }),
      this.prisma.news.count({
        where: { status: 'PUBLISHED', deleted_at: null },
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
