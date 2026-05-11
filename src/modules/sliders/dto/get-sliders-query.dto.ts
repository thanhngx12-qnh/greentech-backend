// File: src/modules/sliders/dto/get-sliders-query.dto.ts
import { IsOptional, IsInt, IsString, Min, Max, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { SliderPosition } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetSlidersQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;

  @ApiPropertyOptional({
    enum: SliderPosition,
    description: 'Lọc banner theo vị trí',
  })
  @IsOptional()
  @IsEnum(SliderPosition)
  position?: SliderPosition;

  @ApiPropertyOptional({
    description: "Trạng thái: 'true' (đang bật) hoặc 'false' (đang tắt)",
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ default: 'vi' })
  @IsOptional()
  @IsString()
  lang?: string = 'vi';
}
