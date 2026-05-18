// File: src/modules/indexing/indexing.module.ts
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { IndexingProcessor } from './indexing.processor';
import { GoogleModule } from '../google/google.module'; // <-- THÊM DÒNG NÀY

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'indexing-queue',
    }),
    GoogleModule, // <-- THÊM VÀO ĐÂY
  ],
  providers: [IndexingProcessor],
  exports: [
    BullModule.registerQueue({
      name: 'indexing-queue',
    }),
  ],
})
export class IndexingModule {}
