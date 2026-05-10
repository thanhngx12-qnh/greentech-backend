// File: src/modules/users/dto/create-user.dto.ts
import {
  IsEmail,
  IsString,
  IsEnum,
  MinLength,
  IsNotEmpty,
} from 'class-validator';
import { Role } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    example: 'nhanvien@greentech.com',
    description: 'Email đăng nhập',
  })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @ApiProperty({
    example: '123456',
    description: 'Mật khẩu khởi tạo (tối thiểu 6 ký tự)',
  })
  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải từ 6 ký tự trở lên' })
  password: string;

  @ApiProperty({
    example: 'Nguyễn Văn Biên Tập',
    description: 'Họ và tên nhân viên',
  })
  @IsString()
  @IsNotEmpty()
  full_name: string;

  @ApiProperty({
    enum: Role,
    example: Role.EDITOR,
    description: 'Quyền hạn trong hệ thống',
  })
  @IsEnum(Role)
  role: Role;
}
