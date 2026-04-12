// File: src/modules/news/dto/create-news.dto.ts
import {
  IsString,
  IsEnum,
  IsInt,
  IsOptional,
  IsObject,
  IsNotEmpty,
  MinLength,
} from 'class-validator';
import { NewsStatus } from '@prisma/client';

export class CreateNewsDto {
  @IsInt()
  category_id: number;

  // --- SLUG (Bắt buộc phải có để làm URL, nhưng Frontend có thể tự sinh từ Title) ---
  @IsString() @IsNotEmpty() slug_vi: string;
  @IsOptional() @IsString() slug_en?: string;
  @IsOptional() @IsString() slug_zh?: string;

  // --- TITLE (Bắt buộc phải có để làm tiêu đề bài viết & SEO) ---
  @IsString()
  @IsNotEmpty()
  @MinLength(5, { message: 'Tiêu đề quá ngắn, vui lòng nhập ít nhất 5 ký tự' })
  title_vi: string;
  @IsOptional() @IsString() title_en?: string;
  @IsOptional() @IsString() title_zh?: string;

  // --- CONTENT (Bắt buộc phải có để có nội dung cho người dùng đọc) ---
  @IsString() @IsNotEmpty() content_vi: string;
  @IsOptional() @IsString() content_en?: string;
  @IsOptional() @IsString() content_zh?: string;

  @IsOptional() @IsString() featured_image?: string;

  @IsOptional()
  @IsEnum(NewsStatus)
  status?: NewsStatus;

  // --- SEO SUITE (Có thể để trống, nhưng nếu có thì sẽ cực tốt cho SEO) ---
  @IsOptional()
  @IsObject()
  seo_i18n?: Record<string, any>;
}
