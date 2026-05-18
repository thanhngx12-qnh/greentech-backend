// File: src/modules/news/news.module.ts
import { Module } from '@nestjs/common';
import { NewsService } from './news.service';
import { NewsController } from './news.controller';
import { NewsPublicController } from './news.public.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { MediaModule } from '../media/media.module';
import { IndexingModule } from '../indexing/indexing.module'; // <-- THÊM DÒNG NÀY

@Module({
  imports: [PrismaModule, MediaModule, IndexingModule], // <-- THÊM VÀO ĐÂY
  controllers: [NewsController, NewsPublicController],
  providers: [NewsService],
  exports: [NewsService],
})
export class NewsModule {}
