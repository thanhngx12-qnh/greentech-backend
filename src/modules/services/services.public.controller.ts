// File: src/modules/services/services.public.controller.ts
import { Controller, Get, Query, Param } from '@nestjs/common';
import { ServicesService } from './services.service';

@Controller('api/public/services')
export class ServicesPublicController {
  constructor(private readonly servicesService: ServicesService) {}

  // Lấy danh sách Dịch vụ (Đã tự động lọc ngôn ngữ & ẩn bài nháp)
  @Get()
  async findAll(@Query() query: any) {
    return this.servicesService.findAllPublic(query);
  }

  // Lấy chi tiết Dịch vụ theo Slug (Chuẩn SEO + Trả về Bản đồ Slug)
  @Get(':slug')
  async findOne(
    @Param('slug') slug: string,
    @Query('lang') lang: string = 'vi',
  ) {
    return this.servicesService.findBySlug(slug, lang);
  }
}
