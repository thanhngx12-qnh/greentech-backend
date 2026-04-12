// File: src/modules/categories/categories.public.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { GetCategoriesQueryDto } from './dto/get-categories-query.dto'; // Sử dụng DTO chuẩn

@Controller('api/public/categories')
export class CategoriesPublicController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async findAll(@Query() query: GetCategoriesQueryDto) {
    // Chúng ta không hardcode nữa.
    // Chúng ta cho phép Frontend gửi lên bất kỳ tham số nào (type, search, sort...)
    // Nhưng chúng ta sẽ ép thêm điều kiện: CHỈ được lấy những cái đang active (is_active = true)

    const publicQuery: GetCategoriesQueryDto = {
      ...query,
      status: 'true', // Đảm bảo khách hàng không bao giờ thấy danh mục đã bị ẩn
    };

    return this.categoriesService.findAll(publicQuery);
  }
}
