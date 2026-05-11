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
    SearchModule,
    AuditLogsModule,
    SlidersModule,
    HealthModule,
    StandardsModule,
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000, // Thời gian (miliseconds) - ở đây là 1 phút
        limit: 20, // Số lần gọi tối đa trong 1 phút cho các API thông thường
      },
      {
        name: 'strict',
        ttl: 60000,
        limit: 3, // Chỉ cho phép 3 lần/phút cho các API nhạy cảm (Form)
      },
    ]),
    BullModule.forRoot({
      connection: {
        host: 'localhost',
        port: 6379,
        maxRetriesPerRequest: null,
      },
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // 🎯 Kích hoạt bảo vệ toàn hệ thống bằng ThrottlerGuard
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
