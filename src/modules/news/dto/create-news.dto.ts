// File: src/modules/news/dto/create-news.dto.ts
import {
  IsString,
  IsEnum,
  IsInt,
  IsOptional,
  IsObject,
  IsNotEmpty,
  MinLength,
  IsBoolean,
} from 'class-validator';
import { NewsStatus } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'; // <-- Thêm
import { SeoDetailDto } from './seo-detail.dto';

export class CreateNewsDto {
  @ApiProperty({ example: 1, description: 'ID của danh mục tin tức' })
  @IsInt()
  category_id: number;

  // --- SLUG (Dạng phẳng) ---
  @ApiProperty({
    example: 'tin-tuc-greentech-2026',
    description: 'Slug đường dẫn (vi)',
  })
  @IsString()
  @IsNotEmpty()
  slug_vi: string;

  @ApiPropertyOptional({
    example: 'greentech-news-2026',
    description: 'Slug đường dẫn (en)',
  })
  @IsOptional()
  @IsString()
  slug_en?: string;

  @ApiPropertyOptional({ description: 'Slug đường dẫn (zh)' })
  @IsOptional()
  @IsString()
  slug_zh?: string;

  // --- TITLE (Dạng phẳng) ---
  @ApiProperty({
    example: 'Tin tức Greentech mới nhất',
    description: 'Tiêu đề bài viết (vi)',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(5, { message: 'Tiêu đề quá ngắn, vui lòng nhập ít nhất 5 ký tự' })
  title_vi: string;

  @ApiPropertyOptional({
    example: 'Latest Greentech News',
    description: 'Tiêu đề bài viết (en)',
  })
  @IsOptional()
  @IsString()
  title_en?: string;

  @ApiPropertyOptional({ description: 'Tiêu đề bài viết (zh)' })
  @IsOptional()
  @IsString()
  title_zh?: string;

  // --- CONTENT (Dạng phẳng) ---
  @ApiProperty({
    example: '<p>Nội dung soạn thảo bằng TinyMCE...</p>',
    description: 'Nội dung chi tiết (vi)',
  })
  @IsString()
  @IsNotEmpty()
  content_vi: string;

  @ApiPropertyOptional({ description: 'Nội dung chi tiết (en)' })
  @IsOptional()
  @IsString()
  content_en?: string;

  @ApiPropertyOptional({ description: 'Nội dung chi tiết (zh)' })
  @IsOptional()
  @IsString()
  content_zh?: string;

  @ApiPropertyOptional({
    example: 'https://cloudinary.com/.../cover.webp',
    description: 'Ảnh đại diện chính của bài viết',
  })
  @IsOptional()
  @IsString()
  featured_image?: string;

  @ApiPropertyOptional({
    enum: NewsStatus,
    example: NewsStatus.DRAFT,
    description: 'Trạng thái bài viết',
  })
  @IsOptional()
  @IsEnum(NewsStatus)
  status?: NewsStatus;

  @ApiPropertyOptional({
    type: 'object',
    description: 'Bộ cấu hình SEO cho các ngôn ngữ (Sử dụng SeoDetailDto)',
    additionalProperties: { $ref: '#/components/schemas/SeoDetailDto' },
  })
  @IsOptional()
  @IsObject()
  seo_i18n?: Record<string, SeoDetailDto>;

  @ApiPropertyOptional({
    description:
      'Bật/Tắt việc gửi yêu cầu Index lên Google khi bài viết được PUBLISHED',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  is_index_request?: boolean = true;
}
