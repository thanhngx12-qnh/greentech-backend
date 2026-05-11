// File: src/modules/leads/dto/create-lead.dto.ts
import {
  IsString,
  IsEmail,
  IsOptional,
  IsBoolean,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLeadDto {
  @ApiProperty({ example: 'Nguyễn Văn An', description: 'Họ tên khách hàng' })
  @IsString()
  @IsNotEmpty({ message: 'Vui lòng nhập họ tên' })
  full_name: string;

  @ApiProperty({
    example: 'an.nguyen@company.com',
    description: 'Email liên hệ',
  })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @ApiPropertyOptional({ example: '0987654321', description: 'Số điện thoại' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    example: 'Công ty TNHH Môi trường Xanh',
    description: 'Tên công ty',
  })
  @IsOptional()
  @IsString()
  company_name?: string;

  @ApiProperty({
    example: 'Tôi cần báo giá dịch vụ phân tích nước thải.',
    description: 'Nội dung yêu cầu',
  })
  @IsString()
  @IsNotEmpty({ message: 'Vui lòng nhập nội dung yêu cầu' })
  content: string;

  @ApiPropertyOptional({
    description: 'Tích chọn đồng ý nhận email marketing',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  consent_email?: boolean;

  // --- UTM TRACKING ---
  @ApiPropertyOptional({ example: 'google', description: 'Nguồn traffic' })
  @IsOptional()
  @IsString()
  utm_source?: string;

  @ApiPropertyOptional({ example: 'cpc', description: 'Phương thức' })
  @IsOptional()
  @IsString()
  utm_medium?: string;

  @ApiPropertyOptional({
    example: 'water_analysis_campaign',
    description: 'Tên chiến dịch',
  })
  @IsOptional()
  @IsString()
  utm_campaign?: string;

  @ApiPropertyOptional({ description: 'Link trang giới thiệu' })
  @IsOptional()
  @IsString()
  referrer?: string;
}
