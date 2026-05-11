// File: src/modules/services/services.controller.ts
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
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Role } from '@prisma/client';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Admin - Quản lý Dịch vụ (Commercial)') // 🎯 Nhóm Swagger
@ApiBearerAuth() // 🎯 Yêu cầu Token để Test trên web
@Controller('admin/services')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.EDITOR, Role.SALES)
  @ApiOperation({ summary: 'Tạo dịch vụ phân tích hóa học mới' })
  create(@Body() dto: CreateServiceDto, @Request() req: any) {
    return this.servicesService.create(dto, req.user.userId);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.EDITOR, Role.SALES)
  @ApiOperation({ summary: 'Lấy danh sách dịch vụ (Admin - Toàn bộ dữ liệu)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'DRAFT, PUBLISHED, etc.',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Tìm theo tên dịch vụ tiếng Việt/Anh',
  })
  findAll(@Query() query: any) {
    return this.servicesService.findAll(query);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.EDITOR, Role.SALES)
  @ApiOperation({
    summary: 'Xem chi tiết dịch vụ (Dùng để lấy dữ liệu đổ vào form sửa)',
  })
  @ApiParam({ name: 'id', description: 'UUID của dịch vụ' })
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(id);
  }

  @Put(':id')
  @Roles(Role.SUPER_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Cập nhật thông tin dịch vụ' })
  @ApiParam({ name: 'id', description: 'ID bài cần sửa' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateServiceDto,
    @Request() req: any,
  ) {
    return this.servicesService.update(id, dto, req.user.userId);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Xóa dịch vụ (Soft Delete)' })
  @ApiParam({ name: 'id', description: 'ID bài cần xóa' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.servicesService.remove(id, req.user.userId);
  }
}
