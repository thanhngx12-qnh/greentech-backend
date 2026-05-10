// File: src/modules/news/news.public.controller.ts
import { Controller, Get, Query, Param } from '@nestjs/common';
import { NewsService } from './news.service';

@Controller('api/public/news')
export class NewsPublicController {
  constructor(private readonly newsService: NewsService) {}

  // Lấy danh sách bài viết cho Landing Page (Đã bóc tách đa ngôn ngữ)
  @Get()
  async findAll(@Query() query: any) {
    // Gọi hàm findAllPublic thay vì findAll của Admin
    return this.newsService.findAllPublic(query);
  }

  // Xem chi tiết bài viết bằng SLUG (Chuẩn SEO + Hreflang Map)
  @Get(':slug')
  async findOne(
    @Param('slug') slug: string,
    @Query('lang') lang: string = 'vi',
  ) {
    return this.newsService.findBySlug(slug, lang);
  }
}
