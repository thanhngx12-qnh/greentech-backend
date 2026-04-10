// File: src/common/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

// Tạo một Decorator tên là 'Roles'
// Nó sẽ lưu trữ mảng các Role được phép truy cập vào Metadata của hàm đó
export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
