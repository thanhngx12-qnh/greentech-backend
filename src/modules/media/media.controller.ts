// File: src/modules/media/media.controller.ts
import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('admin/media')
@UseGuards(JwtAuthGuard)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    // Cloudinary sẽ trả về một đường link URL xịn sò
    const url = await this.mediaService.uploadFile(file);

    // Trả về đúng format { location: ... } để TinyMCE có thể đọc được
    return { location: url };
  }
}
