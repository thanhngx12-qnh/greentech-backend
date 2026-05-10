// File: src/modules/careers/job-postings.public.controller.ts
import { Controller, Get, Query, Param } from '@nestjs/common';
import { JobPostingsService } from './job-postings.service';
import { GetJobPostingsQueryDto } from './dto/get-job-postings-query.dto';

@Controller('api/public/job-postings')
export class JobPostingsPublicController {
  constructor(private readonly jobPostingsService: JobPostingsService) {}

  // Lấy danh sách tin tuyển dụng cho Website
  @Get()
  async findAll(@Query() query: GetJobPostingsQueryDto) {
    // Gọi hàm findAllPublic (Đã được làm phẳng dữ liệu theo ngôn ngữ)
    return this.jobPostingsService.findAllPublic(query);
  }

  // Xem chi tiết tin tuyển dụng (Chuẩn SEO + Trả về Bản đồ Slug)
  @Get(':slug')
  async findOne(
    @Param('slug') slug: string,
    @Query('lang') lang: string = 'vi',
  ) {
    return this.jobPostingsService.findBySlug(slug, lang);
  }
}
