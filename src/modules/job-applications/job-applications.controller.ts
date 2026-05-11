// File: src/modules/job-applications/job-applications.controller.ts
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
import { JobApplicationsService } from './job-applications.service';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { GetApplicationsQueryDto } from './dto/get-applications-query.dto';
import { ExportApplicationsQueryDto } from './dto/export-applications-query.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Role } from '@prisma/client';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Admin - Quản lý Ứng viên (Job Applications)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/job-applications')
export class JobApplicationsController {
  constructor(
    private readonly jobApplicationsService: JobApplicationsService,
  ) {}

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.EDITOR)
  @ApiOperation({
    summary: 'Lấy danh sách hồ sơ ứng viên (Kèm lọc & phân trang)',
  })
  findAll(@Query() query: GetApplicationsQueryDto) {
    return this.jobApplicationsService.findAll(query);
  }

  @Get('export')
  @Roles(Role.SUPER_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Xuất file Excel/CSV danh sách hồ sơ ứng viên' })
  async exportApplications(
    @Query() query: ExportApplicationsQueryDto,
    @Request() req: any,
    @Res() res: express.Response,
  ) {
    const csv = await this.jobApplicationsService.exportToCsv(
      query,
      req.user.userId,
    );
    const filename = `Greentech_CV_List_${new Date().toISOString().split('T')[0]}.csv`;

    res.header('Content-Type', 'text/csv; charset=utf-8');
    res.attachment(filename);
    return res.send(csv);
  }

  @Put(':id/status')
  @Roles(Role.SUPER_ADMIN, Role.EDITOR)
  @ApiOperation({
    summary: 'Cập nhật trạng thái xử lý hồ sơ (VD: Mời phỏng vấn, Từ chối...)',
  })
  @ApiParam({ name: 'id', description: 'ID của hồ sơ cần cập nhật' })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateApplicationStatusDto,
    @Request() req: any,
  ) {
    return this.jobApplicationsService.updateStatus(id, dto, req.user.userId);
  }
}
