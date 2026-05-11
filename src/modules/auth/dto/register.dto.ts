// File: src/modules/auth/dto/register.dto.ts
import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    example: 'superadmin@greentech.com',
    description: 'Email dùng để đăng nhập hệ thống CMS',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Admin!@#123',
    description: 'Mật khẩu phải có ít nhất 6 ký tự',
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: 'Giám đốc Kỹ thuật',
    description: 'Họ và tên người dùng',
  })
  @IsString()
  full_name: string;
}
