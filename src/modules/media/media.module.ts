// File: src/modules/media/media.module.ts
import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaController } from './media.controller'; // <-- 1. PHẢI IMPORT CONTROLLER NÀY

@Module({
  providers: [MediaService],
  controllers: [MediaController], // <-- 2. PHẢI THÊM DÒNG NÀY ĐỂ ĐĂNG KÝ ROUTE
  exports: [MediaService],
})
export class MediaModule {}
