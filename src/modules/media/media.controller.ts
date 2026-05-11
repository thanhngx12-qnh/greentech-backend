// File: src/modules/media/media.controller.ts
import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Admin - Quản lý Media (Ảnh & File)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file')) // Frontend bắt buộc gửi key là 'file'
  @ApiOperation({
    summary: 'Upload file (Ảnh hoặc CV)',
    description:
      'API này nhận 1 file, tự động đẩy lên Cloudinary và trả về URL. Có cơ chế tự nén ảnh về WebP nếu là file ảnh.',
  })
  @ApiConsumes('multipart/form-data') // 🎯 Báo cho Swagger biết API dùng form-data
  @ApiBody({
    // 🎯 Mô tả trường upload file trên Swagger
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['file'],
    },
  })
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException({
        errorCode: 'FILE_MISSING',
        message: 'Vui lòng đính kèm file cần upload',
      });
    }

    const url = await this.mediaService.uploadFile(file);

    // Trả về format { location: ... } để trình soạn thảo TinyMCE hiểu được
    return { location: url };
  }
}
