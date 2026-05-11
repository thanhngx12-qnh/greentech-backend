// File: src/modules/standards/standards.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { StandardsService } from './standards.service';
import { CreateStandardDto } from './dto/create-standard.dto';
import { UpdateStandardDto } from './dto/update-standard.dto';
import { GetStandardsQueryDto } from './dto/get-standards-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Admin - Quản lý Tiêu chuẩn (Standards)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/standards')
export class StandardsController {
  constructor(private readonly standardsService: StandardsService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Thêm một Tiêu chuẩn/Quy chuẩn mới' })
  create(@Body() dto: CreateStandardDto, @Request() req: any) {
    return this.standardsService.create(dto, req.user.userId);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.EDITOR)
  @ApiOperation({
    summary: 'Lấy danh sách Tiêu chuẩn (Có phân trang, tìm kiếm)',
  })
  findAll(@Query() query: GetStandardsQueryDto) {
    return this.standardsService.findAll(query);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Xem chi tiết một Tiêu chuẩn' })
  @ApiParam({ name: 'id', description: 'ID của Tiêu chuẩn' })
  findOne(@Param('id') id: string) {
    return this.standardsService.findOne(id);
  }

  @Put(':id')
  @Roles(Role.SUPER_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Cập nhật Tiêu chuẩn' })
  @ApiParam({ name: 'id', description: 'ID của Tiêu chuẩn cần sửa' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateStandardDto,
    @Request() req: any,
  ) {
    return this.standardsService.update(id, dto, req.user.userId);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Xóa Tiêu chuẩn (Soft Delete)' })
  @ApiParam({ name: 'id', description: 'ID của Tiêu chuẩn cần xóa' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.standardsService.remove(id, req.user.userId);
  }
}
