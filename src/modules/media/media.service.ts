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
    // Khởi tạo cấu hình Cloudinary từ biến môi trường
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  /**
   * Upload ảnh lên Cloudinary
   * @param file File từ Multer
   * @returns URL bảo mật (https) của ảnh trên Cloudinary
   */
  async uploadFile(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'greentech-media', // Tạo một thư mục riêng trên Cloudinary cho gọn
          format: 'webp', // (Tùy chọn) Ép kiểu ảnh về WebP để tối ưu SEO & Tốc độ
          quality: 'auto', // Tự động nén ảnh mà không giảm chất lượng
        },
        (error: UploadApiErrorResponse, result: UploadApiResponse) => {
          if (error) {
            console.error('Cloudinary Upload Error:', error);
            return reject(
              new InternalServerErrorException(
                'Không thể upload ảnh lên Cloudinary',
              ),
            );
          }

          // Trả về secure_url (URL https an toàn)
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

      // Chuyển đổi buffer của file thành stream và "bơm" lên Cloudinary
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
