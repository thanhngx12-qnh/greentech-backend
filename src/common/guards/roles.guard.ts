// File: src/common/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Lấy danh sách Role được yêu cầu từ Decorator @Roles(...)
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Nếu API này không dán nhãn @Roles -> Ai có Token cũng vào được
    if (!requiredRoles) {
      return true;
    }

    // 2. Lấy thông tin User đã được JwtStrategy giải mã và gắn vào request
    const { user } = context.switchToHttp().getRequest();

    // 3. Kiểm tra xem Role của User có nằm trong danh sách Role được phép không
    return requiredRoles.some((role) => user.role?.includes(role));
  }
}
