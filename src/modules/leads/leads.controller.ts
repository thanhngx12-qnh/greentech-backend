// File: src/modules/leads/leads.controller.ts
import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { LeadsService } from './leads.service';
import { UpdateLeadStatusDto } from './dto/update-lead-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('admin/leads')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.SALES) // Sales được vào xem khách hàng
  findAll(@Query() query: any) {
    return this.leadsService.findAll(query);
  }

  @Put(':id/status')
  @Roles(Role.SUPER_ADMIN, Role.SALES) // Sales được cập nhật trạng thái chăm sóc
  updateStatus(@Param('id') id: string, @Body() dto: UpdateLeadStatusDto) {
    return this.leadsService.updateStatus(id, dto);
  }
}
