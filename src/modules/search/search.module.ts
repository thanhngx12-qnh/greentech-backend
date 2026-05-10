// File: src/modules/search/search.module.ts
import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchPublicController } from './search.public.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SearchPublicController],
  providers: [SearchService],
  exports: [SearchService], // Export nếu sau này cần module khác gọi nội bộ
})
export class SearchModule {}
