// File: src/modules/global-settings/dto/update-setting.dto.ts
import { IsString, IsNotEmpty, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSettingDto {
  @ApiProperty({
    description: 'Tên của cài đặt (VD: hotline, contact_email)',
    example: 'hotline',
  })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty({
    description:
      'Giá trị của cài đặt. Có thể là text hoặc object JSON đa ngôn ngữ.',
    example: { value: '0987654321' },
  })
  @IsObject() // Vì chúng ta lưu dạng JSONB, nên giá trị gửi lên cũng phải là 1 object
  @IsNotEmpty()
  value: any;
}
