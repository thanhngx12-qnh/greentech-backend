// File: src/modules/categories/categories.public.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { GetCategoriesQueryDto } from './dto/get-categories-query.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Website - Danh mục (Categories)')
@Controller('api/public/categories')
export class CategoriesPublicController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({
    summary: 'Lấy danh mục cho Menu/Dropdown trên Website',
    description:
      'Dữ liệu đã được làm phẳng và chỉ trả về các danh mục đang active.',
  })
  async findAll(@Query() query: GetCategoriesQueryDto) {
    const publicQuery: GetCategoriesQueryDto = {
      ...query,
      status: 'true', // Chỉ lấy những cái đang active
    };

    return this.categoriesService.findAll(publicQuery);
  }
}
