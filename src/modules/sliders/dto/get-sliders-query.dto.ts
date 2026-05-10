// File: src/modules/sliders/dto/get-sliders-query.dto.ts
import { IsOptional, IsInt, IsString, Min, Max, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { SliderPosition } from '@prisma/client';

export class GetSlidersQueryDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(50) limit?: number =
    10;

  @IsOptional() @IsEnum(SliderPosition) position?: SliderPosition;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsString() lang?: string = 'vi';
}
