// File: src/modules/audit-logs/audit-logs.controller.ts
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Admin - Giám sát Hệ thống (Audit Logs)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/audit-logs')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @Roles(Role.SUPER_ADMIN) // Chỉ SUPER_ADMIN mới được xem
  @ApiOperation({
    summary: 'Xem lịch sử hoạt động của toàn bộ hệ thống (Camera An ninh)',
    description:
      'API này trả về danh sách ghi lại mọi hành động Thêm/Sửa/Xóa dữ liệu quan trọng trong CMS.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'module',
    required: false,
    description: 'Lọc theo module cụ thể',
    enum: [
      'NEWS',
      'SERVICES',
      'JOB_POSTINGS',
      'CATEGORIES',
      'LEADS',
      'SLIDERS',
      'USERS',
    ],
  })
  @ApiQuery({
    name: 'action',
    required: false,
    description: 'Lọc theo hành động',
    enum: ['CREATE', 'UPDATE', 'DELETE'],
  })
  @ApiQuery({
    name: 'user_id',
    required: false,
    description: 'Lọc theo ID của một nhân viên cụ thể',
  })
  findAll(@Query() query: any) {
    return this.auditLogsService.findAll(query);
  }
}
