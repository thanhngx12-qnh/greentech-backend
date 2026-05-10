// File: src/modules/media/media.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  v2 as cloudinary,
  UploadApiResponse,
  UploadApiErrorResponse,
} from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class MediaService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      // 1. Kiểm tra xem file gửi lên là ẢNH hay TÀI LIỆU
      const isImage = file.mimetype.startsWith('image/');

      // 2. Cấu hình thông minh
      const options: any = {
        folder: 'greentech-media',
        resource_type: 'auto', // Cloudinary tự nhận diện File, Image hoặc Video
      };

      // 3. Nếu là Ảnh (từ TinyMCE), tự động nén và ép sang WebP
      if (isImage) {
        options.format = 'webp';
        options.quality = 'auto';
      }

      // 4. Bắt đầu luồng Upload
      const uploadStream = cloudinary.uploader.upload_stream(
        options,
        (error: UploadApiErrorResponse, result: UploadApiResponse) => {
          if (error) {
            console.error('Cloudinary Upload Error Detail:', error.message);
            return reject(
              new InternalServerErrorException(
                'Không thể upload file lên Cloudinary',
              ),
            );
          }
          if (result) {
            resolve(result.secure_url);
          } else {
            reject(
              new InternalServerErrorException(
                'Lỗi không xác định từ Cloudinary',
              ),
            );
          }
        },
      );

      Readable.from(file.buffer).pipe(uploadStream);
    });
  }
  /**
   * Xóa file trên Cloudinary (Dùng cho sau này)
   */
  async deleteFile(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error('Cloudinary Delete Error:', error);
    }
  }
}
