// File: src/modules/job-applications/job-applications.controller.ts
import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JobApplicationsService } from './job-applications.service';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { GetApplicationsQueryDto } from './dto/get-applications-query.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Role } from '@prisma/client';

@Controller('admin/job-applications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class JobApplicationsController {
  constructor(
    private readonly jobApplicationsService: JobApplicationsService,
  ) {}

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.EDITOR) // Admin và HR được xem CV
  findAll(@Query() query: GetApplicationsQueryDto) {
    return this.jobApplicationsService.findAll(query);
  }

  @Put(':id/status')
  @Roles(Role.SUPER_ADMIN, Role.EDITOR)
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateApplicationStatusDto,
  ) {
    return this.jobApplicationsService.updateStatus(id, dto);
  }
}
