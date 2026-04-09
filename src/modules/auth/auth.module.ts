// File: src/modules/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller'; // Đảm bảo file này tên là auth.controller.ts
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      // Sửa lỗi TS2322 bằng cách dùng 'as any' để ép kiểu cho expiresIn
      signOptions: { expiresIn: (process.env.JWT_EXPIRES_IN as any) || '1d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
