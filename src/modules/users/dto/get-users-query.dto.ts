// File: src/modules/users/dto/get-users-query.dto.ts
import { IsOptional, IsEnum, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { Role } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetUsersQueryDto {
  @ApiPropertyOptional({ description: 'Trang hiện tại', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Số bản ghi mỗi trang', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({ enum: Role, description: 'Lọc theo quyền hạn' })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional({ description: 'Tìm kiếm theo tên hoặc email' })
  @IsOptional()
  @IsString()
  search?: string;
}
