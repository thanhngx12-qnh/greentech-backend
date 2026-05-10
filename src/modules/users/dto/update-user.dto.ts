// File: src/modules/users/dto/update-user.dto.ts
import { PartialType } from '@nestjs/swagger'; // Dùng từ swagger để giữ lại các decorator
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({
    example: 'newpassword123',
    description: 'Mật khẩu mới (nếu muốn đổi)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;
}
