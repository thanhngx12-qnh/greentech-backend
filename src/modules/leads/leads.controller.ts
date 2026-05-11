// File: src/modules/leads/leads.controller.ts
import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Res,
} from '@nestjs/common';
import * as express from 'express';
import { LeadsService } from './leads.service';
import { UpdateLeadStatusDto } from './dto/update-lead-status.dto';
import { ExportLeadsQueryDto } from './dto/export-leads-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Admin - Quản lý Khách hàng (Leads)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.SALES)
  @ApiOperation({ summary: 'Lấy danh sách khách hàng tiềm năng' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['NEW', 'CONTACTED', 'QUALIFIED', 'CLOSED'],
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Tìm theo tên/email khách hàng',
  })
  findAll(@Query() query: any) {
    return this.leadsService.findAll(query);
  }

  @Get('export')
  @Roles(Role.SUPER_ADMIN, Role.SALES)
  @ApiOperation({ summary: 'Tải file CSV báo cáo danh sách khách hàng' })
  async exportLeads(
    @Query() query: ExportLeadsQueryDto,
    @Request() req: any,
    @Res() res: express.Response,
  ) {
    const csv = await this.leadsService.exportToCsv(query, req.user.userId);
    const filename = `Greentech_Leads_${new Date().toISOString().split('T')[0]}.csv`;

    res.header('Content-Type', 'text/csv; charset=utf-8');
    res.attachment(filename);
    return res.send(csv);
  }

  @Put(':id/status')
  @Roles(Role.SUPER_ADMIN, Role.SALES)
  @ApiOperation({ summary: 'Cập nhật trạng thái chăm sóc khách hàng' })
  @ApiParam({ name: 'id', description: 'ID của Lead cần cập nhật' })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateLeadStatusDto,
    @Request() req: any,
  ) {
    return this.leadsService.updateStatus(id, dto, req.user.userId);
  }
}
