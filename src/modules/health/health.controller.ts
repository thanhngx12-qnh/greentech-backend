// File: src/modules/health/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  HttpHealthIndicator,
  HealthCheck,
  PrismaHealthIndicator,
  MicroserviceHealthIndicator,
} from '@nestjs/terminus';
import { PrismaService } from '../../prisma/prisma.service';
import { Transport } from '@nestjs/microservices';

@Controller('api/health') // Endpoint: http://localhost:3000/api/health
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private db: PrismaHealthIndicator,
    private prisma: PrismaService,
    private redis: MicroserviceHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      // 1. Kiểm tra kết nối tới Database (PostgreSQL)
      () => this.db.pingCheck('database', this.prisma),

      // 2. Kiểm tra kết nối tới Redis
      () =>
        this.redis.pingCheck('redis', {
          transport: Transport.REDIS,
          options: {
            host: process.env.REDIS_HOST || 'localhost',
            port: Number(process.env.REDIS_PORT) || 6379,
          },
        }),

      // 3. Kiểm tra website có đang phản hồi không (Tự check chính mình)
      () => this.http.pingCheck('nestjs-docs', 'https://docs.nestjs.com'),
    ]);
  }
}
