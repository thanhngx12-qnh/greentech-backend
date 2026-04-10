// File: src/app.controller.ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { Roles } from './common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller()
export class AppController {
  @Get('public')
  getPublic() {
    return { message: 'Chào bạn, đây là nội dung công khai!' };
  }

  @UseGuards(JwtAuthGuard, RolesGuard) // Phải qua cả 2 lớp bảo vệ
  @Roles(Role.SUPER_ADMIN) // Chỉ SUPER_ADMIN mới được vào
  @Get('admin-only')
  getAdminData() {
    return { message: 'Chúc mừng! Bạn là Admin và đã vào được phòng bí mật.' };
  }
}
