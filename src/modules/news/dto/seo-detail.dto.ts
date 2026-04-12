// File: src/modules/news/dto/seo-detail.dto.ts
import { IsOptional, IsString } from 'class-validator';

export class SeoDetailDto {
  @IsOptional()
  @IsString()
  meta_title?: string;

  @IsOptional()
  @IsString()
  meta_description?: string;

  @IsOptional()
  @IsString()
  meta_keywords?: string;

  @IsOptional()
  @IsString()
  og_image?: string; // Link ảnh khi share Facebook/Zalo

  @IsOptional()
  @IsString()
  og_title?: string;

  @IsOptional()
  @IsString()
  og_description?: string;

  @IsOptional()
  @IsString()
  twitter_card?: string; // e.g., 'summary_large_image'
}
