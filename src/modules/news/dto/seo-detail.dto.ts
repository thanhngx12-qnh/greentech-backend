// File: src/modules/news/dto/seo-detail.dto.ts
import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SeoDetailDto {
  @ApiPropertyOptional({
    example: 'Tiêu đề bài viết SEO',
    description: 'Thẻ meta title cho Google',
  })
  @IsOptional()
  @IsString()
  meta_title?: string;

  @ApiPropertyOptional({
    example: 'Mô tả ngắn về bài viết cho kết quả tìm kiếm',
    description: 'Thẻ meta description',
  })
  @IsOptional()
  @IsString()
  meta_description?: string;

  @ApiPropertyOptional({
    example: 'tin tuc, phân tích, hóa học',
    description: 'Từ khóa tìm kiếm',
  })
  @IsOptional()
  @IsString()
  meta_keywords?: string;

  @ApiPropertyOptional({
    example: 'https://cloudinary.com/.../social-thumb.webp',
    description: 'Ảnh hiển thị khi share Facebook/LinkedIn',
  })
  @IsOptional()
  @IsString()
  og_image?: string;

  @ApiPropertyOptional({
    example: 'Tiêu đề hiển thị trên Social',
    description: 'Thẻ og:title',
  })
  @IsOptional()
  @IsString()
  og_title?: string;

  @ApiPropertyOptional({
    example: 'Mô tả hiển thị trên Social',
    description: 'Thẻ og:description',
  })
  @IsOptional()
  @IsString()
  og_description?: string;

  @ApiPropertyOptional({
    example: 'summary_large_image',
    description: 'Loại thẻ hiển thị trên Twitter/X',
  })
  @IsOptional()
  @IsString()
  twitter_card?: string;
}
