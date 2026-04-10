// -----------------------------------------------------------------------------
// File: src/modules/auth/strategies/jwt.strategy.ts
// Chức năng: Tự động trích xuất và kiểm tra tính hợp lệ của JWT Token
// -----------------------------------------------------------------------------
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Role } from '@prisma/client';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // Tìm token trong Header: Authorization: Bearer <token>
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // SỬA LỖI TẠI ĐÂY: Thêm 'as string' để khẳng định với TypeScript
      secretOrKey: process.env.JWT_SECRET as string,
    });
  }

  /**
   * Hàm này chạy sau khi Token được kiểm tra là hợp lệ.
   * Dữ liệu từ payload sẽ được gắn vào request.user
   */
  async validate(payload: any) {
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role as Role,
    };
  }
}
