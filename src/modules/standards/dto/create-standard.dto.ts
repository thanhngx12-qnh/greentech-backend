// File: src/modules/standards/dto/create-standard.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsEnum,
  IsObject,
} from 'class-validator';
import { NewsStatus } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStandardDto {
  @ApiProperty({ description: 'ID của danh mục tiêu chuẩn' })
  @IsInt()
  category_id: number;

  @ApiProperty({
    example: 'QCVN 40:2011/BTNMT',
    description: 'Mã tiêu chuẩn (Unique)',
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  // --- SLUG, TITLE, CONTENT (Đa ngôn ngữ) ---
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  slug_vi: string;
  @ApiPropertyOptional() @IsOptional() @IsString() slug_en?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() slug_zh?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title_vi: string;
  @ApiPropertyOptional() @IsOptional() @IsString() title_en?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() title_zh?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() content_vi?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() content_en?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() content_zh?: string;

  @ApiPropertyOptional({
    description: 'Link file PDF đã upload lên Cloudinary',
  })
  @IsOptional()
  @IsString()
  file_url?: string;

  @ApiPropertyOptional({ enum: NewsStatus, default: NewsStatus.PUBLISHED })
  @IsOptional()
  @IsEnum(NewsStatus)
  status?: NewsStatus;

  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  @IsOptional()
  @IsObject()
  seo_i18n?: Record<string, any>;
}
