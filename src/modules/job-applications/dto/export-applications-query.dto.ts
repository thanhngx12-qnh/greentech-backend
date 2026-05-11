// File: src/modules/job-applications/dto/export-applications-query.dto.ts
import { IsOptional, IsString, IsDateString, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

const VALID_STATUSES = ['NEW', 'REVIEWING', 'INTERVIEW', 'REJECTED', 'HIRED'];

export class ExportApplicationsQueryDto {
  @ApiPropertyOptional({
    description: 'Chỉ xuất hồ sơ của một tin tuyển dụng (Job ID)',
  })
  @IsOptional()
  @IsString()
  job_id?: string;

  @ApiPropertyOptional({
    enum: VALID_STATUSES,
    description: 'Lọc hồ sơ theo trạng thái trước khi xuất',
  })
  @IsOptional()
  @IsString()
  @IsIn(VALID_STATUSES)
  status?: string;

  @ApiPropertyOptional({ description: 'Lọc từ ngày (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Lọc đến ngày (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ default: 'vi' })
  @IsOptional()
  @IsString()
  lang?: string = 'vi';
}
