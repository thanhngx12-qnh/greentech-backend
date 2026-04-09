// File: src/prisma/prisma.module.ts
// Chức năng: Đóng gói PrismaService thành một Module để có thể sử dụng ở các module khác
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // <--- QUAN TRỌNG: Dùng @Global để chỉ cần Import PrismaModule 1 lần duy nhất ở AppModule,
// sau đó mọi module khác (Admin, Public...) đều dùng được PrismaService mà không cần Import lại.
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // Cho phép các module khác "mượn" PrismaService
})
export class PrismaModule {}
