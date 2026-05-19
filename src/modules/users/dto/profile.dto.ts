// File: src/modules/users/dto/profile.dto.ts
import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({ example: 'Tên mới của tôi' })
  @IsString()
  @IsNotEmpty()
  full_name: string;
}

export class ChangePasswordDto {
  @ApiProperty({ description: 'Mật khẩu hiện tại' })
  @IsString()
  @IsNotEmpty()
  old_password: string;

  @ApiProperty({ description: 'Mật khẩu mới (tối thiểu 6 ký tự)' })
  @IsString()
  @MinLength(6)
  new_password: string;

  @ApiProperty({ description: 'Nhập lại mật khẩu mới' })
  @IsString()
  @MinLength(6)
  confirm_password: string;
}
