// File: src/modules/services/dto/create-service.dto.ts
import {
  IsString,
  IsEnum,
  IsInt,
  IsOptional,
  IsObject,
  IsNotEmpty,
  IsNumber,
  Min,
} from 'class-validator';
import { ServiceStatus } from '@prisma/client';

export class CreateServiceDto {
  @IsInt()
  category_id: number;

  @IsOptional()
  @IsString()
  author_id?: string;

  // --- SLUG (Phẳng) ---
  @IsString() @IsNotEmpty() slug_vi: string;
  @IsOptional() @IsString() slug_en?: string;
  @IsOptional() @IsString() slug_zh?: string;

  // --- TITLE (Phẳng) ---
  @IsString() @IsNotEmpty() title_vi: string;
  @IsOptional() @IsString() title_en?: string;
  @IsOptional() @IsString() title_zh?: string;

  // --- CONTENT (Phẳng) ---
  @IsString() @IsNotEmpty() content_vi: string;
  @IsOptional() @IsString() content_en?: string;
  @IsOptional() @IsString() content_zh?: string;

  // --- COMMERCIAL DATA (Mới thêm) ---
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsString()
  currency?: string = 'VND';

  @IsOptional()
  @IsString()
  duration?: string;

  // --- MEDIA & SEO ---
  @IsOptional() @IsString() featured_image?: string;

  @IsOptional()
  @IsEnum(ServiceStatus)
  status?: ServiceStatus;

  @IsOptional()
  @IsObject()
  seo_i18n?: Record<string, any>;
}
