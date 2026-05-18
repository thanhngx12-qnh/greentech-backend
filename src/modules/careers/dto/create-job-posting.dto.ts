// File: src/modules/careers/dto/create-job-posting.dto.ts
import {
  IsString,
  IsEnum,
  IsInt,
  IsOptional,
  IsObject,
  IsNotEmpty,
  IsDateString,
  IsBoolean,
} from 'class-validator';
import { JobType, JobStatus } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateJobPostingDto {
  @ApiProperty({ example: 1, description: 'ID danh mục tuyển dụng' })
  @IsInt()
  @IsNotEmpty()
  category_id: number;

  // --- SLUG (Dạng phẳng) ---
  @ApiProperty({
    example: 'tuyen-ky-su-hoa-hoc',
    description: 'Đường dẫn SEO (vi)',
  })
  @IsString()
  @IsNotEmpty()
  slug_vi: string;

  @ApiPropertyOptional({
    example: 'chemical-engineer-hiring',
    description: 'Đường dẫn SEO (en)',
  })
  @IsOptional()
  @IsString()
  slug_en?: string;

  @ApiPropertyOptional({ description: 'Đường dẫn SEO (zh)' })
  @IsOptional()
  @IsString()
  slug_zh?: string;

  // --- TITLE (Dạng phẳng) ---
  @ApiProperty({
    example: 'Kỹ sư Phân tích Hóa học',
    description: 'Tên vị trí (vi)',
  })
  @IsString()
  @IsNotEmpty()
  title_vi: string;

  @ApiPropertyOptional({ example: 'Chemical Analysis Engineer' })
  @IsOptional()
  @IsString()
  title_en?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title_zh?: string;

  // --- DESCRIPTION (Nội dung chi tiết) ---
  @ApiProperty({
    example: '<p>Mô tả công việc bằng HTML...</p>',
    description: 'Mô tả (vi)',
  })
  @IsString()
  @IsNotEmpty()
  description_vi: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description_en?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description_zh?: string;

  // --- 🎯 FIX LỖI TẠI ĐÂY: Thêm additionalProperties cho Object ---
  @ApiPropertyOptional({
    type: 'object',
    additionalProperties: true,
    description: 'Yêu cầu công việc đa ngôn ngữ',
    example: { vi: 'Bằng đại học', en: 'Degree' },
  })
  @IsOptional()
  @IsObject()
  requirements_i18n?: Record<string, string>;

  @ApiPropertyOptional({
    type: 'object',
    additionalProperties: true,
    description: 'Quyền lợi đa ngôn ngữ',
  })
  @IsOptional()
  @IsObject()
  benefits_i18n?: Record<string, string>;

  // --- ADDITIONAL FIELDS ---
  @ApiPropertyOptional({ example: 'Hà Nội', description: 'Địa điểm làm việc' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({
    example: '15 - 20 Triệu VNĐ',
    description: 'Khoảng lương',
  })
  @IsOptional()
  @IsString()
  salary_range?: string;

  @ApiPropertyOptional({ enum: JobType, default: JobType.FULL_TIME })
  @IsOptional()
  @IsEnum(JobType)
  type?: JobType;

  @ApiPropertyOptional({ enum: JobStatus, default: JobStatus.DRAFT })
  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus;

  @ApiPropertyOptional({
    example: '2026-12-31',
    description: 'Hạn chót nộp hồ sơ (ISO)',
  })
  @IsOptional()
  @IsDateString()
  deadline?: string;

  @ApiPropertyOptional({
    type: 'object',
    additionalProperties: true,
    description: 'Cấu hình SEO chi tiết (SeoDetailDto)',
  })
  @IsOptional()
  @IsObject()
  seo_i18n?: Record<string, any>;

  @ApiPropertyOptional({
    description:
      'Bật/Tắt việc gửi yêu cầu Index lên Google khi dịch vụ được PUBLISHED',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  is_index_request?: boolean = true;
}
