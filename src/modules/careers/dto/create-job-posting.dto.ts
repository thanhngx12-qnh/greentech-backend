// src/modules/careers/dto/create-job-posting.dto.ts
import {
  IsString,
  IsEnum,
  IsInt,
  IsOptional,
  IsObject,
  IsNotEmpty,
  IsDateString,
} from 'class-validator';
import { JobType, JobStatus } from '@prisma/client';

export class CreateJobPostingDto {
  @IsInt() @IsNotEmpty() category_id: number;

  @IsString() @IsNotEmpty() slug_vi: string;
  @IsOptional() @IsString() slug_en?: string;
  @IsOptional() @IsString() slug_zh?: string;

  @IsString() @IsNotEmpty() title_vi: string;
  @IsOptional() @IsString() title_en?: string;
  @IsOptional() @IsString() title_zh?: string;

  @IsString() @IsNotEmpty() description_vi: string;
  @IsOptional() @IsString() description_en?: string;
  @IsOptional() @IsString() description_zh?: string;

  @IsOptional() @IsObject() requirements_i18n?: Record<string, string>;
  @IsOptional() @IsObject() benefits_i18n?: Record<string, string>;

  @IsOptional() @IsString() location?: string;
  @IsOptional() @IsString() salary_range?: string;

  @IsOptional() @IsEnum(JobType) type?: JobType;
  @IsOptional() @IsEnum(JobStatus) status?: JobStatus;

  @IsOptional() @IsDateString() deadline?: string;
  @IsOptional() @IsObject() seo_i18n?: Record<string, any>;
}
