// File: src/modules/services/services.public.controller.ts
import { Controller, Get, Query, Param } from '@nestjs/common';
import { ServicesService } from './services.service';
import { ApiTags, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';

@ApiTags('Website - Dịch vụ') // 🎯 Nhóm dành cho khách hàng
@Controller('api/public/services')
export class ServicesPublicController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách dịch vụ (Dữ liệu phẳng, đa ngôn ngữ)',
  })
  @ApiQuery({
    name: 'lang',
    required: false,
    example: 'vi',
    description: 'Mã ngôn ngữ cần hiển thị',
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  async findAll(@Query() query: any) {
    return this.servicesService.findAllPublic(query);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Xem chi tiết dịch vụ theo đường dẫn SEO (Slug)' })
  @ApiParam({
    name: 'slug',
    description: 'Đường dẫn dịch vụ (vd: phan-tich-chat-luong-nuoc)',
  })
  @ApiQuery({ name: 'lang', required: false, example: 'vi' })
  async findOne(
    @Param('slug') slug: string,
    @Query('lang') lang: string = 'vi',
  ) {
    return this.servicesService.findBySlug(slug, lang);
  }
}
