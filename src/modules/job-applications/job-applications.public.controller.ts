// File: src/modules/job-applications/job-applications.public.controller.ts
import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JobApplicationsService } from './job-applications.service';
import { SubmitApplicationDto } from './dto/submit-application.dto';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';

@ApiTags('Website - Tuyển dụng')
@Controller('api/public/job-applications')
export class JobApplicationsPublicController {
  constructor(
    private readonly jobApplicationsService: JobApplicationsService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @Throttle({ strict: { limit: 3, ttl: 60000 } })
  @ApiOperation({
    summary: 'Ứng viên nộp hồ sơ (CV)',
    description:
      'API nhận thông tin và file CV từ form ứng tuyển trên Website.',
  })
  @ApiConsumes('multipart/form-data') // 🎯 Báo cho Swagger biết API này dùng form-data
  @ApiBody({
    // 🎯 Mô tả các trường trong form-data
    schema: {
      type: 'object',
      properties: {
        job_id: { type: 'string' },
        full_name: { type: 'string' },
        email: { type: 'string', format: 'email' },
        phone: { type: 'string' },
        message: { type: 'string' },
        file: {
          // 🎯 Mô tả cho trường upload file
          type: 'string',
          format: 'binary',
        },
      },
      required: ['job_id', 'full_name', 'email', 'phone', 'file'],
    },
  })
  submitForm(
    @Body() dto: SubmitApplicationDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException({
        errorCode: 'FILE_MISSING',
        message: 'Vui lòng đính kèm CV của bạn.',
      });
    }
    return this.jobApplicationsService.submit(dto, file);
  }
}
