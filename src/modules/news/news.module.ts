// File: src/modules/news/news.module.ts
import { Module } from '@nestjs/common';
import { NewsService } from './news.service';
import { NewsController } from './news.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { MediaModule } from '../media/media.module';
import { NewsPublicController } from './news.public.controller';

@Module({
  imports: [PrismaModule, MediaModule],
  controllers: [NewsController, NewsPublicController],
  providers: [NewsService],
  exports: [NewsService],
})
export class NewsModule {}
