// File: src/modules/news/news.public.controller.ts
import { Controller, Get, Query, Param } from '@nestjs/common';
import { NewsService } from './news.service';

@Controller('api/public/news')
export class NewsPublicController {
  constructor(private readonly newsService: NewsService) {}

  // Lấy danh sách bài viết cho Landing Page
  @Get()
  async findAll(@Query() query: any) {
    return this.newsService.findAll({
      ...query,
      status: 'PUBLISHED', // Chỉ cho phép khách xem bài đã đăng
    });
  }

  // Xem chi tiết bài viết bằng SLUG (Chuẩn SEO)
  @Get(':slug')
  async findOne(
    @Param('slug') slug: string,
    @Query('lang') lang: string = 'vi',
  ) {
    return this.newsService.findBySlug(slug, lang);
  }
}
