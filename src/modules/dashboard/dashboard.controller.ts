// File: src/modules/dashboard/dashboard.controller.ts
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { GetStatsQueryDto } from './dto/get-stats-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Admin - Dashboard Thống kê')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @Roles(Role.SUPER_ADMIN, Role.EDITOR, Role.SALES)
  @ApiOperation({ summary: 'Lấy các chỉ số thống kê nhanh (Widgets)' })
  getStats(@Query() query: GetStatsQueryDto) {
    return this.dashboardService.getStats(query);
  }

  @Get('lead-growth')
  @Roles(Role.SUPER_ADMIN, Role.SALES)
  @ApiOperation({ summary: 'Lấy dữ liệu tăng trưởng Leads để vẽ biểu đồ' })
  getLeadGrowth(@Query() query: GetStatsQueryDto) {
    return this.dashboardService.getLeadGrowth(query);
  }

  @Get('top-search-keywords')
  @Roles(Role.SUPER_ADMIN, Role.EDITOR)
  @ApiOperation({
    summary: 'Lấy Top 10 từ khóa được khách hàng tìm nhiều nhất',
  })
  getTopSearchKeywords() {
    return this.dashboardService.getTopSearchKeywords();
  }

  @Get('recent-activities')
  @Roles(Role.SUPER_ADMIN, Role.EDITOR)
  @ApiOperation({
    summary: 'Lấy 10 hoạt động nội dung gần nhất (News, Services, Jobs)',
  })
  getRecentActivities() {
    return this.dashboardService.getRecentActivities();
  }

  @Get('lead-funnel')
  @Roles(Role.SUPER_ADMIN, Role.SALES)
  @ApiOperation({ summary: 'Thống kê phễu chuyển đổi khách hàng (Leads)' })
  getLeadConversionFunnel() {
    return this.dashboardService.getLeadConversionFunnel();
  }
}
