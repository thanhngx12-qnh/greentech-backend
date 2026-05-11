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
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('DevOps - Health Check')
@Controller('api/health')
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
  @ApiOperation({
    summary: 'Kiểm tra "sức khỏe" toàn bộ hệ thống',
    description:
      'API này được dùng bởi hệ thống giám sát (Monitoring) để kiểm tra xem các dịch vụ cốt lõi (Database, Redis...) có đang hoạt động bình thường không. Nếu một trong các dịch vụ "down", API sẽ trả về lỗi 503.',
  })
  @ApiResponse({
    status: 200,
    description: 'Tất cả dịch vụ đều đang hoạt động tốt (UP).',
  })
  @ApiResponse({
    status: 503,
    description: 'Một hoặc nhiều dịch vụ đang gặp sự cố (DOWN).',
  })
  check() {
    return this.health.check([
      // 1. Kiểm tra kết nối tới Database (PostgreSQL)
      () => this.db.pingCheck('database', this.prisma),

      // 2. Kiểm tra kết nối tới Redis (Dùng cho Queue)
      () =>
        this.redis.pingCheck('redis', {
          transport: Transport.REDIS,
          options: {
            host: process.env.REDIS_HOST || 'localhost',
            port: Number(process.env.REDIS_PORT) || 6379,
          },
        }),

      // 3. Kiểm tra kết nối internet của server
      () => this.http.pingCheck('outbound_internet', 'https://google.com'),
    ]);
  }
}
