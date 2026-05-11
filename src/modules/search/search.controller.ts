// File: src/modules/search/search.controller.ts
import {
  Controller,
  Get,
  Query,
  UseGuards,
  Request,
  Res,
} from '@nestjs/common';
import * as express from 'express'; // 🎯 Import an toàn tránh lỗi TS1272
import { SearchService } from './search.service';
import { GetSearchLogsQueryDto } from './dto/get-search-logs-query.dto';
import { ExportSearchLogsQueryDto } from './dto/export-search-logs-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Admin - Phân tích Tìm kiếm (Marketing)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/search-logs')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.EDITOR) // Editor/Marketing cũng cần xem để biết xu hướng
  @ApiOperation({
    summary: 'Xem danh sách lịch sử từ khóa khách hàng tìm kiếm',
  })
  findAll(@Query() query: GetSearchLogsQueryDto) {
    return this.searchService.findAllAdmin(query);
  }

  @Get('export')
  @Roles(Role.SUPER_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Tải file CSV báo cáo lịch sử tìm kiếm' })
  async exportCsv(
    @Query() query: ExportSearchLogsQueryDto,
    @Request() req: any,
    @Res() res: express.Response,
  ) {
    const csv = await this.searchService.exportToCsv(query, req.user.userId);
    const filename = `Greentech_SearchLogs_${new Date().toISOString().split('T')[0]}.csv`;

    // 🎯 Ép trình duyệt tự động tải file
    res.header('Content-Type', 'text/csv; charset=utf-8');
    res.attachment(filename);
    return res.send(csv);
  }
}
