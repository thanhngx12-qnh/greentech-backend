// File: src/app.module.ts

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { MediaModule } from './modules/media/media.module';
import { NewsModule } from './modules/news/news.module';
import { ServicesModule } from './modules/services/services.module';
import { BullModule } from '@nestjs/bullmq';
import { LeadsModule } from './modules/leads/leads.module';
import { CareersModule } from './modules/careers/careers.module';
import { JobApplicationsModule } from './modules/job-applications/job-applications.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AuthModule,
    CategoriesModule,
    MediaModule,
    NewsModule,
    ServicesModule,
    LeadsModule,
    CareersModule,
    JobApplicationsModule,
    BullModule.forRoot({
      connection: {
        host: 'localhost',
        port: 6379,
        maxRetriesPerRequest: null,
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
