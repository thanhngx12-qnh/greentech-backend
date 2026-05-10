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

@Controller('api/public/job-applications')
export class JobApplicationsPublicController {
  constructor(
    private readonly jobApplicationsService: JobApplicationsService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('file')) // Frontend bắt buộc gửi file với key là 'file'
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
