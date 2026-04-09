// File: src/prisma/prisma.service.ts
// Chức năng: Class trung gian kết nối NestJS với Prisma Client để truy vấn DB
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  /**
   * Khi Module được khởi chạy (NestJS startup),
   * hàm này sẽ kết nối tới Database.
   */
  async onModuleInit() {
    await this.$connect();
    console.log('🚀 PrismaService: Connected to Database successfully');
  }

  /**
   * Khi ứng dụng tắt (NestJS shutdown),
   * hàm này sẽ ngắt kết nối để giải phóng tài nguyên.
   */
  async onModuleDestroy() {
    await this.$disconnect();
    console.log('🔌 PrismaService: Disconnected from Database');
  }
}
