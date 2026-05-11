// File: src/modules/leads/leads.public.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Website - Form (Leads & Subscribe)')
@Controller('api/public/leads')
export class LeadsPublicController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  @Throttle({ strict: { limit: 3, ttl: 60000 } }) // Chống spam 3 lần/phút
  @ApiOperation({
    summary: 'Tiếp nhận Form Báo giá/Liên hệ từ khách hàng',
    description:
      'API này có cơ chế chống spam 2 lớp: Rate Limit theo IP và kiểm tra Email gửi gần đây.',
  })
  async submitForm(@Body() dto: CreateLeadDto) {
    return this.leadsService.submitForm(dto);
  }
}
