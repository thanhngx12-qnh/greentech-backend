// File: src/app.module.ts
// Chức năng: Root Module của toàn bộ ứng dụng
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module'; // <-- Thêm dòng này

@Module({
  imports: [PrismaModule], // <-- Thêm PrismaModule vào đây
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
