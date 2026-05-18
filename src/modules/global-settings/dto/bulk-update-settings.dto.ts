// File: src/modules/global-settings/dto/bulk-update-settings.dto.ts
import {
  IsArray,
  ValidateNested,
  IsString,
  IsNotEmpty,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

// 1. Định nghĩa cấu trúc cho TỪNG CÀI ĐẶT trong mảng
class SingleSettingDto {
  @ApiProperty({ example: 'hotline' })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty({ example: { value: '1900 9999' } })
  @IsObject()
  @IsNotEmpty()
  value: any;
}

// 2. Định nghĩa DTO chính, chứa một MẢNG các cài đặt
export class BulkUpdateSettingsDto {
  @ApiProperty({
    type: [SingleSettingDto], // Báo cho Swagger biết đây là một mảng các object
    description: 'Mảng chứa các cài đặt cần được cập nhật hàng loạt',
  })
  @IsArray()
  @ValidateNested({ each: true }) // Yêu cầu validator kiểm tra từng object trong mảng
  @Type(() => SingleSettingDto) // Ép kiểu từng phần tử trong mảng thành SingleSettingDto
  settings: SingleSettingDto[];
}
