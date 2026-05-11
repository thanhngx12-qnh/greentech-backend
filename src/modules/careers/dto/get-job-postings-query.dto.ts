// File: src/modules/careers/dto/get-job-postings-query.dto.ts
import {
  IsOptional,
  IsEnum,
  IsInt,
  IsString,
  Min,
  Max,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { JobStatus, JobType } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class GetJobPostingsQueryDto {
  @ApiPropertyOptional({ description: 'Trang cần xem', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Số lượng bản ghi mỗi trang',
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;

  @ApiPropertyOptional({
    enum: ['deadline', 'created_at', 'location'],
    description: 'Trường dùng để sắp xếp',
    default: 'created_at',
  })
  @IsOptional()
  @IsString()
  @IsIn(['deadline', 'created_at', 'location'])
  sortBy?: string = 'created_at';

  @ApiPropertyOptional({
    enum: SortOrder,
    description: 'Thứ tự sắp xếp',
    default: SortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  order?: SortOrder = SortOrder.DESC;

  @ApiPropertyOptional({
    enum: JobStatus,
    description: 'Lọc theo trạng thái tin tuyển dụng',
  })
  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus;

  @ApiPropertyOptional({
    enum: JobType,
    description: 'Lọc theo loại hình công việc (FULL_TIME, INTERN...)',
  })
  @IsOptional()
  @IsEnum(JobType)
  type?: JobType;

  @ApiPropertyOptional({ description: 'Tìm theo địa điểm cụ thể' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: 'Tìm mờ theo Tiêu đề hoặc Mô tả' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Ngôn ngữ kết quả (vi, en, zh)',
    default: 'vi',
  })
  @IsOptional()
  @IsString()
  lang?: string = 'vi';
}
