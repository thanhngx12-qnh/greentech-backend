// File: src/modules/dashboard/dto/get-stats-query.dto.ts
import { IsOptional, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetStatsQueryDto {
  @ApiPropertyOptional({
    description: 'Thống kê từ ngày (YYYY-MM-DD)',
    example: '2026-05-01',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Thống kê đến ngày (YYYY-MM-DD)',
    example: '2026-05-31',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
