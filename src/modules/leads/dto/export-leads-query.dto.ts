// File: src/modules/leads/dto/export-leads-query.dto.ts
import { IsOptional, IsString, IsDateString, IsEnum } from 'class-validator';
import { LeadStatus } from '@prisma/client';

export class ExportLeadsQueryDto {
  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'Ngày bắt đầu không đúng định dạng ISO (YYYY-MM-DD)' },
  )
  startDate?: string;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'Ngày kết thúc không đúng định dạng ISO (YYYY-MM-DD)' },
  )
  endDate?: string;

  @IsOptional()
  @IsString()
  lang?: string = 'vi'; // Để dịch tiêu đề cột trong file Excel
}
