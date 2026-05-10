// File: src/modules/leads/leads.public.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';

@Controller('api/public/leads')
export class LeadsPublicController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  submitForm(@Body() dto: CreateLeadDto) {
    return this.leadsService.submitForm(dto);
  }
}
