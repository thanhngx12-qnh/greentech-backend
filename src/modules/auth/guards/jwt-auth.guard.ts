// -----------------------------------------------------------------------------
// File: src/modules/auth/guards/jwt-auth.guard.ts
// Chức năng: Guard dùng để bảo vệ các API, yêu cầu phải có JWT hợp lệ
// -----------------------------------------------------------------------------
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
