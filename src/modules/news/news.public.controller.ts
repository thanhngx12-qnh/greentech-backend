// File: src/modules/news/news.public.controller.ts
import { Controller, Get, Query, Param } from '@nestjs/common';
import { NewsService } from './news.service';
import { ApiTags, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';

@ApiTags('Website - Tin tức') // 🎯 Nhóm dành cho khách hàng
@Controller('api/public/news')
export class NewsPublicController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách tin tức (Dữ liệu đã làm phẳng theo ngôn ngữ)',
  })
  @ApiQuery({
    name: 'lang',
    required: false,
    example: 'vi',
    description: 'vi, en hoặc zh',
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Tìm mờ tiếng Việt có dấu',
  })
  async findAll(@Query() query: any) {
    return this.newsService.findAllPublic(query);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Xem chi tiết tin tức theo đường dẫn SEO (Slug)' })
  @ApiParam({ name: 'slug', description: 'Ví dụ: tin-tuc-greentech-moi' })
  @ApiQuery({ name: 'lang', required: false, example: 'vi' })
  async findOne(
    @Param('slug') slug: string,
    @Query('lang') lang: string = 'vi',
  ) {
    return this.newsService.findBySlug(slug, lang);
  }
}
