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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateServiceDto {
  @ApiProperty({ example: 2, description: 'ID danh mục dịch vụ' })
  @IsInt()
  category_id: number;

  @ApiPropertyOptional({
    description: 'ID tác giả (nếu không gửi sẽ lấy theo người đăng nhập)',
  })
  @IsOptional()
  @IsString()
  author_id?: string;

  // --- SLUG ---
  @ApiProperty({
    example: 'phan-tich-hoa-hoc',
    description: 'Đường dẫn SEO (vi)',
  })
  @IsString()
  @IsNotEmpty()
  slug_vi: string;
  @IsOptional() @IsString() slug_en?: string;
  @IsOptional() @IsString() slug_zh?: string;

  // --- TITLE ---
  @ApiProperty({
    example: 'Dịch vụ Phân tích Hóa học',
    description: 'Tên dịch vụ (vi)',
  })
  @IsString()
  @IsNotEmpty()
  title_vi: string;
  @IsOptional() @IsString() title_en?: string;
  @IsOptional() @IsString() title_zh?: string;

  // --- CONTENT ---
  @ApiProperty({
    example: '<p>Chi tiết dịch vụ...</p>',
    description: 'Nội dung soạn thảo TinyMCE (vi)',
  })
  @IsString()
  @IsNotEmpty()
  content_vi: string;
  @IsOptional() @IsString() content_en?: string;
  @IsOptional() @IsString() content_zh?: string;

  // --- COMMERCIAL DATA ---
  @ApiPropertyOptional({ example: 2500000, description: 'Giá dịch vụ (vnđ)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ example: 'VND', default: 'VND' })
  @IsOptional()
  @IsString()
  currency?: string = 'VND';

  @ApiPropertyOptional({
    example: '5-7 ngày làm việc',
    description: 'Thời gian hoàn thành',
  })
  @IsOptional()
  @IsString()
  duration?: string;

  // --- MEDIA & SEO ---
  @ApiPropertyOptional({ description: 'URL ảnh đại diện' })
  @IsOptional()
  @IsString()
  featured_image?: string;

  @ApiPropertyOptional({ enum: ServiceStatus, default: ServiceStatus.DRAFT })
  @IsOptional()
  @IsEnum(ServiceStatus)
  status?: ServiceStatus;

  @ApiPropertyOptional({
    type: 'object',
    description: 'Bộ cấu hình SEO cho các ngôn ngữ (Sử dụng SeoDetailDto)',
    additionalProperties: { $ref: '#/components/schemas/SeoDetailDto' },
  })
  @IsOptional()
  @IsObject()
  seo_i18n?: Record<string, any>;
}
