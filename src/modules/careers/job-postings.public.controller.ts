// File: src/modules/careers/job-postings.public.controller.ts
import { Controller, Get, Query, Param } from '@nestjs/common';
import { JobPostingsService } from './job-postings.service';
import { GetJobPostingsQueryDto } from './dto/get-job-postings-query.dto';
import { JobStatus } from '@prisma/client'; // <-- Sửa tại đây: Import JobStatus

@Controller('api/public/job-postings')
export class JobPostingsPublicController {
  constructor(private readonly jobPostingsService: JobPostingsService) {}

  // Lấy danh sách tin tuyển dụng cho ứng viên (Chỉ lấy tin đang OPEN)
  @Get()
  async findAll(@Query() query: GetJobPostingsQueryDto) {
    const publicQuery = {
      ...query,
      status: JobStatus.OPEN, // <-- Sửa tại đây: Dùng JobStatus.OPEN
    };
    return this.jobPostingsService.findAll(publicQuery);
  }

  // Xem chi tiết tin tuyển dụng bằng ID/Slug
  @Get(':slug')
  async findOne(
    @Param('slug') slug: string,
    @Query('lang') lang: string = 'vi',
  ) {
    return this.jobPostingsService.findBySlug(slug, lang);
  }
}
