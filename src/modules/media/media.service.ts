// -----------------------------------------------------------------------------
// File: src/modules/media/media.service.ts
// -----------------------------------------------------------------------------
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MediaService {
  private s3Client: S3Client;
  private readonly bucketName = process.env.MINIO_BUCKET_NAME;

  constructor() {
    this.s3Client = new S3Client({
      endpoint: `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}`,
      region: 'us-east-1',
      credentials: {
        // SỬA LỖI TẠI ĐÂY: Thêm 'as string' để khẳng định với TypeScript
        accessKeyId: process.env.MINIO_ROOT_USER as string,
        secretAccessKey: process.env.MINIO_ROOT_PASSWORD as string,
      },
      forcePathStyle: true,
    });
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await this.s3Client.send(command);

      return `${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${this.bucketName}/${fileName}`;
    } catch (error) {
      console.error('MinIO Upload Error:', error);
      throw new InternalServerErrorException(
        'Không thể upload file lên storage',
      );
    }
  }

  async deleteFile(fileName: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
      });
      await this.s3Client.send(command);
    } catch (error) {
      console.error('MinIO Delete Error:', error);
    }
  }
}
