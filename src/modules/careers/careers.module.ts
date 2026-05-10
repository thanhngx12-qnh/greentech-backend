// File: src/modules/careers/careers.module.ts
import { Module } from '@nestjs/common';
import { JobPostingsService } from './job-postings.service';
import { JobPostingsController } from './job-postings.controller';
import { JobPostingsPublicController } from './job-postings.public.controller'; // THÊM
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [JobPostingsController, JobPostingsPublicController], // THÊM
  providers: [JobPostingsService],
})
export class CareersModule {}
