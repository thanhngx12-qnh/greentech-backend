// File: src/modules/categories/dto/create-category.dto.ts
import {
  IsString,
  IsEnum,
  IsOptional,
  IsObject,
  IsInt,
  IsBoolean,
} from 'class-validator';
import { CategoryType } from '@prisma/client';

export class CreateCategoryDto {
  @IsString()
  slug: string;

  @IsEnum(CategoryType)
  type: CategoryType;

  @IsObject()
  name_i18n: {
    vi: string;
    en?: string;
    zh?: string;
  };

  @IsObject()
  @IsOptional()
  desc_i18n?: {
    vi: string;
    en?: string;
    zh?: string;
  };

  @IsObject()
  @IsOptional()
  seo_i18n?: {
    vi: {
      title?: string;
      slug?: string;
      meta_title?: string;
      meta_description?: string;
    };
    en?: {
      title?: string;
      slug?: string;
      meta_title?: string;
      meta_description?: string;
    };
    zh?: {
      title?: string;
      slug?: string;
      meta_title?: string;
      meta_description?: string;
    };
  };

  @IsInt()
  @IsOptional()
  order: number;

  @IsBoolean()
  @IsOptional()
  is_active: boolean;
}
