// File: src/modules/leads/leads.public.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { Throttle } from '@nestjs/throttler';

@Controller('api/public/leads')
export class LeadsPublicController {
  constructor(private readonly leadsService: LeadsService) {}

  // API tiếp nhận Form đăng ký tư vấn/báo giá từ khách hàng
  @Post()
  @Throttle({ strict: { limit: 3, ttl: 60000 } })
  async submitForm(@Body() dto: CreateLeadDto) {
    // Luồng: Validate -> AntiSpam -> Lưu DB -> Bắn Queue -> Trả về Success
    return this.leadsService.submitForm(dto);
  }
}
