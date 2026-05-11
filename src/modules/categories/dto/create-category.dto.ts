// File: src/modules/categories/dto/create-category.dto.ts
import {
  IsString,
  IsEnum,
  IsOptional,
  IsObject,
  IsInt,
  IsBoolean,
  IsNotEmpty,
} from 'class-validator';
import { CategoryType } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    example: 'dich-vu-moi-truong',
    description: 'Đường dẫn SEO (Unique)',
  })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({
    enum: CategoryType,
    example: CategoryType.SERVICE,
    description: 'Phân loại danh mục',
  })
  @IsEnum(CategoryType)
  type: CategoryType;

  @ApiProperty({
    type: 'object',
    example: { vi: 'Dịch vụ Môi trường', en: 'Environmental Services' },
    description: 'Tên danh mục theo đa ngôn ngữ',
    additionalProperties: false,
  })
  @IsObject()
  name_i18n: {
    vi: string;
    en?: string;
    zh?: string;
  };

  @ApiPropertyOptional({
    type: 'object',
    example: {
      vi: 'Mô tả chi tiết về danh mục...',
      en: 'Detailed description...',
    },
    description: 'Mô tả danh mục (Đa ngôn ngữ)',
    additionalProperties: false,
  })
  @IsObject()
  @IsOptional()
  desc_i18n?: {
    vi: string;
    en?: string;
    zh?: string;
  };

  @ApiPropertyOptional({
    type: 'object',
    additionalProperties: true,
    description: 'Cấu hình SEO chi tiết cho từng ngôn ngữ',
  })
  @IsObject()
  @IsOptional()
  seo_i18n?: Record<string, any>;

  @ApiPropertyOptional({
    example: 1,
    description: 'Thứ tự sắp xếp hiển thị',
    default: 0,
  })
  @IsInt()
  @IsOptional()
  order: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Trạng thái hiển thị',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  is_active: boolean;
}
