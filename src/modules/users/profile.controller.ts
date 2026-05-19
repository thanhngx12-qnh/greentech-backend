// File: src/modules/users/profile.controller.ts
import { Controller, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { UpdateProfileDto, ChangePasswordDto } from './dto/profile.dto'; // <-- Sẽ tạo file này ngay sau

@ApiTags('Admin - Hồ sơ cá nhân (My Profile)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard) // Chỉ cần đăng nhập là được, không cần phân quyền
@Controller('admin/profile')
export class ProfileController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Lấy thông tin hồ sơ của người dùng hiện tại' })
  getProfile(@Request() req: any) {
    // Lấy userId từ Token đã được giải mã
    return this.usersService.getProfile(req.user.userId);
  }

  @Put('me')
  @ApiOperation({ summary: 'Cập nhật thông tin cá nhân (Họ tên)' })
  updateProfile(@Request() req: any, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.userId, dto);
  }

  @Put('change-password')
  @ApiOperation({ summary: 'Đổi mật khẩu' })
  changePassword(@Request() req: any, @Body() dto: ChangePasswordDto) {
    return this.usersService.changePassword(req.user.userId, dto);
  }
}
