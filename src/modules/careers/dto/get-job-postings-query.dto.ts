// src/modules/careers/dto/get-job-postings-query.dto.ts
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

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class GetJobPostingsQueryDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(50) limit?: number =
    10;
  @IsOptional()
  @IsString()
  @IsIn(['deadline', 'created_at', 'location'])
  sortBy?: string = 'created_at';
  @IsOptional() @IsEnum(SortOrder) order?: SortOrder = SortOrder.DESC;

  @IsOptional() @IsEnum(JobStatus) status?: JobStatus;
  @IsOptional() @IsEnum(JobType) type?: JobType;

  @IsOptional() @IsString() location?: string;
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsString() lang?: string = 'vi';
}
