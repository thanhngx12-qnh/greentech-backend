// File: src/modules/news/dto/create-news.dto.ts
import {
  IsString,
  IsEnum,
  IsInt,
  IsOptional,
  IsObject,
  IsNotEmpty,
} from 'class-validator';
import { NewsStatus } from '@prisma/client';
import { SeoDetailDto } from './seo-detail.dto';

export class CreateNewsDto {
  @IsInt()
  category_id: number;

  // SLUG (Phẳng)
  @IsString() @IsNotEmpty() slug_vi: string;
  @IsString() @IsOptional() slug_en?: string;
  @IsString() @IsOptional() slug_zh?: string;

  // TITLE (Phẳng)
  @IsString() @IsNotEmpty() title_vi: string;
  @IsString() @IsOptional() title_en?: string;
  @IsString() @IsOptional() title_zh?: string;

  // CONTENT (Phẳng)
  @IsString() @IsNotEmpty() content_vi: string;
  @IsString() @IsOptional() content_en?: string;
  @IsString() @IsOptional() content_zh?: string;

  @IsOptional() @IsString() featured_image?: string;

  @IsOptional()
  @IsEnum(NewsStatus)
  status?: NewsStatus;

  @IsOptional()
  @IsObject()
  seo_i18n?: Record<string, SeoDetailDto>;
}
