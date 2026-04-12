// File: src/modules/services/services.public.controller.ts
import { Controller, Get, Query, Param } from '@nestjs/common';
import { ServicesService } from './services.service';

@Controller('api/public/services')
export class ServicesPublicController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  async findAll(@Query() query: any) {
    // Gọi hàm findAllPublic để dữ liệu được map chuẩn đa ngôn ngữ
    return this.servicesService.findAllPublic(query);
  }

  @Get(':slug')
  async findOne(
    @Param('slug') slug: string,
    @Query('lang') lang: string = 'vi',
  ) {
    return this.servicesService.findBySlug(slug, lang);
  }
}
