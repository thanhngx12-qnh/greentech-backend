// File: src/modules/careers/careers.module.ts
import { Module } from '@nestjs/common';
import { JobPostingsService } from './job-postings.service';
import { JobPostingsController } from './job-postings.controller';
import { JobPostingsPublicController } from './job-postings.public.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { IndexingModule } from '../indexing/indexing.module'; // <-- THÊM DÒNG NÀY

@Module({
  imports: [PrismaModule, IndexingModule], // <-- THÊM VÀO ĐÂY
  controllers: [JobPostingsController, JobPostingsPublicController],
  providers: [JobPostingsService],
})
export class CareersModule {}
