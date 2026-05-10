// File: src/modules/job-applications/dto/get-applications-query.dto.ts
import { IsOptional, IsInt, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class GetApplicationsQueryDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(50) limit?: number =
    10;

  @IsOptional() @IsString() job_id?: string; // Lọc hồ sơ theo 1 tin tuyển dụng cụ thể
  @IsOptional() @IsString() status?: string; // Lọc theo trạng thái (NEW, HIRED...)
  @IsOptional() @IsString() search?: string; // Tìm theo tên/email ứng viên
}
