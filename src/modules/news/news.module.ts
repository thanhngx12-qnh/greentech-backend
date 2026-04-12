// File: src/modules/news/news.module.ts
import { Module } from '@nestjs/common';
import { NewsService } from './news.service';
import { NewsController } from './news.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { MediaModule } from '../media/media.module'; // <--- THÊM DÒNG NÀY

@Module({
  imports: [PrismaModule, MediaModule], // <--- THÊM MediaModule VÀO ĐÂY
  controllers: [NewsController],
  providers: [NewsService],
  exports: [NewsService],
})
export class NewsModule {}
