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

export class CreateSliderDto {
  @IsString()
  @IsNotEmpty({ message: 'Tên định danh không được để trống' })
  name: string;

  @IsEnum(SliderPosition, { message: 'Vị trí banner không hợp lệ' })
  @IsNotEmpty()
  position: SliderPosition;

  // --- NỘI DUNG TIẾNG VIỆT (Bắt buộc ít nhất bản Việt) ---
  @IsString() @IsNotEmpty() image_desktop_vi: string;
  @IsOptional() @IsString() image_mobile_vi?: string;
  @IsOptional() @IsString() title_vi?: string;
  @IsOptional() @IsString() subtitle_vi?: string;
  @IsOptional() @IsString() link_url_vi?: string;

  // --- NỘI DUNG TIẾNG ANH (Tùy chọn) ---
  @IsOptional() @IsString() image_desktop_en?: string;
  @IsOptional() @IsString() image_mobile_en?: string;
  @IsOptional() @IsString() title_en?: string;
  @IsOptional() @IsString() subtitle_en?: string;
  @IsOptional() @IsString() link_url_en?: string;

  // --- NỘI DUNG TIẾNG TRUNG (Tùy chọn) ---
  @IsOptional() @IsString() image_desktop_zh?: string;
  @IsOptional() @IsString() image_mobile_zh?: string;
  @IsOptional() @IsString() title_zh?: string;
  @IsOptional() @IsString() subtitle_zh?: string;
  @IsOptional() @IsString() link_url_zh?: string;

  @IsOptional() @IsBoolean() is_active?: boolean;
  @IsOptional() @IsInt() order?: number;
}
