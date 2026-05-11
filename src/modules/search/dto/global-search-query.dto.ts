// File: src/modules/search/dto/global-search-query.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'; // <-- THÊM IMPORT

export class GlobalSearchQueryDto {
  @ApiProperty({
    example: 'phân tích',
    description: 'Từ khóa cần tìm kiếm',
  }) // 🎯 Swagger sẽ hiện ô nhập bắt buộc
  @IsString()
  @IsNotEmpty({ message: 'Vui lòng nhập từ khóa tìm kiếm' })
  keyword: string;

  @ApiPropertyOptional({
    example: 'vi',
    description: 'Ngôn ngữ (vi, en, zh)',
    default: 'vi',
  }) // 🎯 Swagger sẽ hiện ô nhập tùy chọn
  @IsOptional()
  @IsString()
  lang?: string = 'vi';

  @ApiPropertyOptional({
    example: 5,
    description: 'Số lượng kết quả mỗi nhóm',
    default: 5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 5;
}
