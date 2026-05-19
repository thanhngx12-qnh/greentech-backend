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
import { SearchModule } from './modules/search/search.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { SlidersModule } from './modules/sliders/sliders.module';
import { HealthModule } from './modules/health/health.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { StandardsModule } from './modules/standards/standards.module';
import { GlobalSettingsModule } from './modules/global-settings/global-settings.module';
import { IndexingModule } from './modules/indexing/indexing.module';
import { GoogleModule } from './modules/google/google.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

@Module({
  imports: [
    // 1. Core Modules & Config (Nền tảng nhất)
    PrismaModule,
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000,
        limit: 1000,
      },
      {
        name: 'strict',
        ttl: 60000,
        limit: 100,
      },
    ]),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT) || 6379,
      },
    }),

    // 2. Foundational Business Modules (Các module nền tảng, ít phụ thuộc)
    GlobalSettingsModule, // 🎯 PHẢI ĐƯỢC IMPORT TRƯỚC
    AuditLogsModule,
    UsersModule,
    DashboardModule,
    AuthModule,
    MediaModule,

    // 3. Dependent Modules (Các module phụ thuộc vào các module trên)
    GoogleModule, // 🎯 Nằm sau GlobalSettings
    IndexingModule, // 🎯 Nằm sau Google

    // 4. Content Modules (Các module nội dung chính)
    CategoriesModule,
    NewsModule,
    ServicesModule,
    CareersModule,
    JobApplicationsModule,
    StandardsModule,
    SlidersModule,

    // 5. Final Modules (Các module chức năng cuối)
    LeadsModule,
    SearchModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
