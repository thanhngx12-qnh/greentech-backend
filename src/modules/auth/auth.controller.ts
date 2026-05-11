// File: src/modules/auth/auth.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Auth - Xác thực & Đăng nhập') // 🎯 Gom nhóm trên Swagger
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Đăng ký tài khoản SUPER_ADMIN đầu tiên',
    description: 'API này chỉ nên dùng một lần duy nhất khi khởi tạo hệ thống.',
  })
  @ApiResponse({ status: 201, description: 'Tạo tài khoản thành công.' })
  @ApiResponse({ status: 400, description: 'Lỗi: Email đã tồn tại.' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Đăng nhập vào hệ thống CMS' })
  @ApiResponse({
    status: 201,
    description: 'Đăng nhập thành công, trả về access_token.',
  })
  @ApiResponse({ status: 401, description: 'Lỗi: Sai email hoặc mật khẩu.' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
