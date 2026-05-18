// File: src/modules/services/services.module.ts
import { Module } from '@nestjs/common';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';
import { ServicesPublicController } from './services.public.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { MediaModule } from '../media/media.module';
import { IndexingModule } from '../indexing/indexing.module'; // <-- THÊM DÒNG NÀY

@Module({
  imports: [PrismaModule, MediaModule, IndexingModule], // <-- THÊM VÀO ĐÂY
  controllers: [ServicesController, ServicesPublicController],
  providers: [ServicesService],
  exports: [ServicesService],
})
export class ServicesModule {}
