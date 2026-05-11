// File: src/modules/search/search.module.ts
import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchPublicController } from './search.public.controller';
import { SearchController } from './search.controller'; // <-- IMPORT THÊM
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SearchPublicController, SearchController], // <-- ĐĂNG KÝ VÀO ĐÂY
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
