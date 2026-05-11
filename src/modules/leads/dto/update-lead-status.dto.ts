// File: src/modules/leads/dto/update-lead-status.dto.ts
import { IsEnum, IsNotEmpty } from 'class-validator';
import { LeadStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateLeadStatusDto {
  @ApiProperty({
    enum: LeadStatus,
    description: 'Trạng thái mới của khách hàng',
  })
  @IsEnum(LeadStatus)
  @IsNotEmpty()
  status: LeadStatus;
}
