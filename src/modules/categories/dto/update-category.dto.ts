// File: src/modules/categories/dto/update-category.dto.ts
import { PartialType } from '@nestjs/swagger'; // 🎯 Đổi sang Swagger
import { CreateCategoryDto } from './create-category.dto';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
