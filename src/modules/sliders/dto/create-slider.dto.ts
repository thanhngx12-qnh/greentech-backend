// File: src/modules/sliders/dto/create-slider.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsInt,
  IsEnum,
} from 'class-validator';
import { SliderPosition } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSliderDto {
  @ApiProperty({
    example: 'Banner Trang chủ Tết 2026',
    description: 'Tên định danh (chỉ dùng nội bộ)',
  })
  @IsString()
  @IsNotEmpty({ message: 'Tên định danh không được để trống' })
  name: string;

  @ApiProperty({
    enum: SliderPosition,
    example: SliderPosition.HOME_TOP,
    description: 'Vị trí hiển thị banner trên Website',
  })
  @IsEnum(SliderPosition, { message: 'Vị trí banner không hợp lệ' })
  @IsNotEmpty()
  position: SliderPosition;

  // --- NỘI DUNG TIẾNG VIỆT ---
  @ApiProperty({ description: 'Link ảnh cho PC (vi)' })
  @IsString()
  @IsNotEmpty()
  image_desktop_vi: string;

  @ApiPropertyOptional({ description: 'Link ảnh cho Mobile (vi)' })
  @IsOptional()
  @IsString()
  image_mobile_vi?: string;

  @ApiPropertyOptional({ description: 'Tiêu đề trên banner (vi)' })
  @IsOptional()
  @IsString()
  title_vi?: string;

  @ApiPropertyOptional({ description: 'Mô tả ngắn trên banner (vi)' })
  @IsOptional()
  @IsString()
  subtitle_vi?: string;

  @ApiPropertyOptional({ description: 'Link khi click vào banner (vi)' })
  @IsOptional()
  @IsString()
  link_url_vi?: string;

  // --- NỘI DUNG TIẾNG ANH ---
  @ApiPropertyOptional({ description: 'Link ảnh cho PC (en)' })
  @IsOptional()
  @IsString()
  image_desktop_en?: string;

  @ApiPropertyOptional({ description: 'Link ảnh cho Mobile (en)' })
  @IsOptional()
  @IsString()
  image_mobile_en?: string;

  @ApiPropertyOptional({ description: 'Tiêu đề trên banner (en)' })
  @IsOptional()
  @IsString()
  title_en?: string;

  @ApiPropertyOptional({ description: 'Mô tả ngắn trên banner (en)' })
  @IsOptional()
  @IsString()
  subtitle_en?: string;

  @ApiPropertyOptional({ description: 'Link khi click vào banner (en)' })
  @IsOptional()
  @IsString()
  link_url_en?: string;

  // --- NỘI DUNG TIẾNG TRUNG ---
  @ApiPropertyOptional({ description: 'Link ảnh cho PC (zh)' })
  @IsOptional()
  @IsString()
  image_desktop_zh?: string;

  @ApiPropertyOptional({ description: 'Link ảnh cho Mobile (zh)' })
  @IsOptional()
  @IsString()
  image_mobile_zh?: string;

  @ApiPropertyOptional({ description: 'Tiêu đề trên banner (zh)' })
  @IsOptional()
  @IsString()
  title_zh?: string;

  @ApiPropertyOptional({ description: 'Mô tả ngắn trên banner (zh)' })
  @IsOptional()
  @IsString()
  subtitle_zh?: string;

  @ApiPropertyOptional({ description: 'Link khi click vào banner (zh)' })
  @IsOptional()
  @IsString()
  link_url_zh?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional({
    default: 0,
    description: 'Thứ tự hiển thị (số nhỏ lên trước)',
  })
  @IsOptional()
  @IsInt()
  order?: number;
}
