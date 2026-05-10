// File: src/modules/health/health.module.ts
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { HealthController } from './health.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [
    TerminusModule, // Thư viện chính cho Health Check
    HttpModule, // Dùng để check các link HTTP bên ngoài
    PrismaModule, // Để lấy PrismaService check DB
  ],
  controllers: [HealthController],
})
export class HealthModule {}
