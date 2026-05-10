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
import * as express from 'express'; // 🎯 FIX: Import namespace để tránh lỗi TypeScript
import { JobApplicationsService } from './job-applications.service';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { GetApplicationsQueryDto } from './dto/get-applications-query.dto';
import { ExportApplicationsQueryDto } from './dto/export-applications-query.dto';
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

  // Lấy danh sách ứng viên (Hiển thị lên bảng quản trị)
  @Get()
  @Roles(Role.SUPER_ADMIN, Role.EDITOR)
  findAll(@Query() query: GetApplicationsQueryDto) {
    return this.jobApplicationsService.findAll(query);
  }

  // 🎯 API XUẤT CSV: Tải danh sách ứng viên và link CV về máy
  @Get('export')
  @Roles(Role.SUPER_ADMIN, Role.EDITOR)
  async exportApplications(
    @Query() query: ExportApplicationsQueryDto,
    @Request() req: any,
    @Res() res: express.Response,
  ) {
    // Gọi service để lấy dữ liệu CSV và ghi log hành động
    const csv = await this.jobApplicationsService.exportToCsv(
      query,
      req.user.userId,
    );

    // Thiết lập tên file theo ngày hiện tại
    const filename = `Greentech_CV_List_${new Date().toISOString().split('T')[0]}.csv`;

    // Thiết lập Header để trình duyệt hiểu là file tải về
    res.header('Content-Type', 'text/csv; charset=utf-8');
    res.attachment(filename);

    return res.send(csv);
  }

  // Cập nhật trạng thái xử lý hồ sơ (Kèm ghi log người thực hiện)
  @Put(':id/status')
  @Roles(Role.SUPER_ADMIN, Role.EDITOR)
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateApplicationStatusDto,
    @Request() req: any,
  ) {
    return this.jobApplicationsService.updateStatus(id, dto, req.user.userId);
  }
}
