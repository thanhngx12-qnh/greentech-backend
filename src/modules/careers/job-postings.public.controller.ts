// File: src/modules/careers/job-postings.public.controller.ts
import { Controller, Get, Query, Param } from '@nestjs/common';
import { JobPostingsService } from './job-postings.service';
import { GetJobPostingsQueryDto } from './dto/get-job-postings-query.dto';
import { ApiTags, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';

@ApiTags('Website - Tuyển dụng')
@Controller('api/public/job-postings')
export class JobPostingsPublicController {
  constructor(private readonly jobPostingsService: JobPostingsService) {}

  @Get()
  @ApiOperation({
    summary:
      'Lấy danh sách tin tuyển dụng (Dữ liệu đã làm phẳng, đang mở - OPEN)',
  })
  async findAll(@Query() query: GetJobPostingsQueryDto) {
    return this.jobPostingsService.findAllPublic(query);
  }

  @Get(':slug')
  @ApiOperation({
    summary: 'Xem chi tiết tin tuyển dụng theo đường dẫn SEO (Slug)',
  })
  @ApiParam({
    name: 'slug',
    description: 'Đường dẫn bài tuyển dụng (vd: ky-su-phan-tich-moi-truong)',
  })
  @ApiQuery({ name: 'lang', required: false, example: 'vi' })
  async findOne(
    @Param('slug') slug: string,
    @Query('lang') lang: string = 'vi',
  ) {
    return this.jobPostingsService.findBySlug(slug, lang);
  }
}
