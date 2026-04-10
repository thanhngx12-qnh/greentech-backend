// File: src/modules/media/media.controller.ts
import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file')) // 'file' là key trong FormData
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const url = await this.mediaService.uploadFile(file);
    return { url };
  }
}
