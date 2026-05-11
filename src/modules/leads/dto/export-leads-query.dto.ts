// File: src/modules/leads/dto/export-leads-query.dto.ts
import { IsOptional, IsString, IsDateString, IsEnum } from 'class-validator';
import { LeadStatus } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ExportLeadsQueryDto {
  @ApiPropertyOptional({
    enum: LeadStatus,
    description: 'Lọc khách theo trạng thái',
  })
  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;

  @ApiPropertyOptional({
    description: 'Từ ngày (YYYY-MM-DD)',
    example: '2026-05-01',
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'Ngày bắt đầu không đúng định dạng ISO (YYYY-MM-DD)' },
  )
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Đến ngày (YYYY-MM-DD)',
    example: '2026-05-31',
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'Ngày kết thúc không đúng định dạng ISO (YYYY-MM-DD)' },
  )
  endDate?: string;

  @ApiPropertyOptional({ description: 'Ngôn ngữ file CSV', default: 'vi' })
  @IsOptional()
  @IsString()
  lang?: string = 'vi';
}
