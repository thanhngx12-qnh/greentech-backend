// File: src/modules/categories/dto/get-categories-query.dto.ts
import {
  IsOptional,
  IsEnum,
  IsInt,
  IsString,
  Min,
  Max,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CategoryType } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class GetCategoriesQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    enum: ['order', 'created_at', 'name'],
    default: 'order',
  })
  @IsOptional()
  @IsString()
  @IsIn(['order', 'created_at', 'name'])
  sortBy?: string = 'order';

  @ApiPropertyOptional({ enum: SortOrder, default: SortOrder.ASC })
  @IsOptional()
  @IsEnum(SortOrder)
  order?: SortOrder = SortOrder.ASC;

  @ApiPropertyOptional({
    enum: CategoryType,
    description: 'Lọc theo loại danh mục',
  })
  @IsOptional()
  @IsEnum(CategoryType)
  type?: CategoryType;

  @ApiPropertyOptional({ description: 'Tìm mờ theo tên danh mục' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: "Lọc theo trạng thái (is_active): 'true' hoặc 'false'",
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ default: 'vi' })
  @IsOptional()
  @IsString()
  lang?: string = 'vi';
}
