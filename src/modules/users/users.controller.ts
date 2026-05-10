// File: src/modules/users/users.controller.ts
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
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetUsersQueryDto } from './dto/get-users-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('Admin - Quản lý Nhân sự') // 🎯 Nhóm Swagger
@ApiBearerAuth() // 🎯 Yêu cầu Token trên Swagger
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN) // 🎯 Chỉ Giám đốc mới được tạo tài khoản nhân viên
  @ApiOperation({ summary: 'Tạo tài khoản nhân viên mới' })
  @ApiResponse({ status: 201, description: 'Tạo thành công' })
  create(@Body() dto: CreateUserDto, @Request() req: any) {
    return this.usersService.create(dto, req.user.userId);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Lấy danh sách toàn bộ nhân viên' })
  findAll(@Query() query: GetUsersQueryDto) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Xem chi tiết thông tin một nhân viên' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Put(':id')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Cập nhật thông tin/quyền hạn nhân viên' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @Request() req: any,
  ) {
    return this.usersService.update(id, dto, req.user.userId);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Vô hiệu hóa tài khoản nhân viên (Soft Delete)' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.usersService.remove(id, req.user.userId);
  }
}
