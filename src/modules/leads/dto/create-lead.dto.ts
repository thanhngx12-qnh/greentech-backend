// File: src/modules/leads/dto/create-lead.dto.ts
import {
  IsString,
  IsEmail,
  IsOptional,
  IsBoolean,
  IsNotEmpty,
} from 'class-validator';

export class CreateLeadDto {
  @IsString()
  @IsNotEmpty({ message: 'Vui lòng nhập họ tên' })
  full_name: string;

  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  company_name?: string;

  @IsString()
  @IsNotEmpty({ message: 'Vui lòng nhập nội dung yêu cầu' })
  content: string;

  @IsOptional()
  @IsBoolean()
  consent_email?: boolean;

  // Tracking UTM từ URL (Dùng cho Marketing)
  @IsOptional() @IsString() utm_source?: string;
  @IsOptional() @IsString() utm_medium?: string;
  @IsOptional() @IsString() utm_campaign?: string;
  @IsOptional() @IsString() referrer?: string;
}
