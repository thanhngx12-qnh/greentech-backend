// File: src/modules/job-applications/job-applications.module.ts
import { Module } from '@nestjs/common';
import { JobApplicationsService } from './job-applications.service';
import { JobApplicationsController } from './job-applications.controller';
import { JobApplicationsPublicController } from './job-applications.public.controller';
import { JobApplicationProcessor } from './job-application.processor';
import { PrismaModule } from '../../prisma/prisma.module';
import { MediaModule } from '../media/media.module';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    PrismaModule,
    MediaModule,
    BullModule.registerQueue({
      name: 'job-applications-queue',
    }),
  ],
  controllers: [JobApplicationsController, JobApplicationsPublicController],
  providers: [JobApplicationsService, JobApplicationProcessor],
})
export class JobApplicationsModule {}
