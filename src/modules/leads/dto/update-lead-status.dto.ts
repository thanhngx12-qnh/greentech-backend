// File: src/modules/leads/dto/update-lead-status.dto.ts
import { IsEnum, IsNotEmpty } from 'class-validator';
import { LeadStatus } from '@prisma/client'; // NEW, CONTACTED, QUALIFIED, CLOSED

export class UpdateLeadStatusDto {
  @IsEnum(LeadStatus)
  @IsNotEmpty()
  status: LeadStatus;
}
