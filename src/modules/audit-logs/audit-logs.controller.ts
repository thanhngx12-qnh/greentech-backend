// File: src/modules/audit-logs/audit-logs.controller.ts
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('admin/audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @Roles(Role.SUPER_ADMIN) // QUAN TRỌNG: Chỉ có Giám đốc (SUPER_ADMIN) mới được xem lịch sử hệ thống
  findAll(@Query() query: any) {
    return this.auditLogsService.findAll(query);
  }
}
