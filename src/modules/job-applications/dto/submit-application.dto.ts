// File: src/modules/job-applications/dto/submit-application.dto.ts
import { IsString, IsEmail, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubmitApplicationDto {
  @ApiProperty({ description: 'ID của tin tuyển dụng mà ứng viên nộp vào' })
  @IsString()
  @IsNotEmpty()
  job_id: string;

  @ApiProperty({ example: 'Nguyễn Thị Ứng Viên', description: 'Họ tên đầy đủ' })
  @IsString()
  @IsNotEmpty({ message: 'Vui lòng nhập họ tên' })
  full_name: string;

  @ApiProperty({
    example: 'candidate.nguyen@email.com',
    description: 'Email để HR liên hệ',
  })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @ApiProperty({ example: '0909090909', description: 'Số điện thoại liên hệ' })
  @IsString()
  @IsNotEmpty({ message: 'Vui lòng nhập số điện thoại' })
  phone: string;

  @ApiPropertyOptional({ description: 'Thư giới thiệu hoặc lời nhắn gửi HR' })
  @IsOptional()
  @IsString()
  message?: string;
}
