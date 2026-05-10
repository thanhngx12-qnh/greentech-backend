// File: src/modules/careers/dto/update-job-posting.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateJobPostingDto } from './create-job-posting.dto';

export class UpdateJobPostingDto extends PartialType(CreateJobPostingDto) {}
