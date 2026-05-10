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
import * as express from 'express'; // 🎯 FIX: Import namespace để tránh lỗi TS1272
import { LeadsService } from './leads.service';
import { UpdateLeadStatusDto } from './dto/update-lead-status.dto';
import { ExportLeadsQueryDto } from './dto/export-leads-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('admin/leads')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.SALES)
  findAll(@Query() query: any) {
    return this.leadsService.findAll(query);
  }

  @Get('export')
  @Roles(Role.SUPER_ADMIN, Role.SALES)
  async exportLeads(
    @Query() query: ExportLeadsQueryDto,
    @Request() req: any,
    @Res() res: express.Response, // 🎯 FIX: Sử dụng express.Response
  ) {
    const csv = await this.leadsService.exportToCsv(query, req.user.userId);
    const filename = `Greentech_Leads_${new Date().toISOString().split('T')[0]}.csv`;

    res.header('Content-Type', 'text/csv; charset=utf-8');
    res.attachment(filename);
    return res.send(csv);
  }

  @Put(':id/status')
  @Roles(Role.SUPER_ADMIN, Role.SALES)
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateLeadStatusDto,
    @Request() req: any,
  ) {
    return this.leadsService.updateStatus(id, dto, req.user.userId);
  }
}
