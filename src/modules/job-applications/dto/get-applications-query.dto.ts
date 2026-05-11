// File: src/modules/job-applications/dto/get-applications-query.dto.ts
import { IsOptional, IsInt, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetApplicationsQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Lọc hồ sơ theo một tin tuyển dụng cụ thể (Job ID)',
  })
  @IsOptional()
  @IsString()
  job_id?: string;

  @ApiPropertyOptional({
    enum: ['NEW', 'REVIEWING', 'INTERVIEW', 'REJECTED', 'HIRED'],
    description: 'Lọc hồ sơ theo trạng thái xử lý',
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    description: 'Tìm theo tên, email, hoặc SĐT của ứng viên',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
