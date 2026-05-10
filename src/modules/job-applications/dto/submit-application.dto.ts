// File: src/modules/job-applications/dto/submit-application.dto.ts
import { IsString, IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class SubmitApplicationDto {
  @IsString()
  @IsNotEmpty()
  job_id: string; // ID của tin tuyển dụng

  @IsString()
  @IsNotEmpty({ message: 'Vui lòng nhập họ tên' })
  full_name: string;

  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Vui lòng nhập số điện thoại' })
  phone: string;

  @IsOptional()
  @IsString()
  message?: string; // Lời nhắn/Cover letter
}
