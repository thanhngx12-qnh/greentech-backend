// File: src/modules/leads/leads.public.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';

@Controller('api/public/leads')
export class LeadsPublicController {
  constructor(private readonly leadsService: LeadsService) {}

  // API tiếp nhận Form đăng ký tư vấn/báo giá từ khách hàng
  @Post()
  async submitForm(@Body() dto: CreateLeadDto) {
    // Luồng: Validate -> AntiSpam -> Lưu DB -> Bắn Queue -> Trả về Success
    return this.leadsService.submitForm(dto);
  }
}
