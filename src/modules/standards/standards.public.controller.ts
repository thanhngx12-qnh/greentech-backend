// File: src/modules/standards/standards.public.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { StandardsService } from './standards.service';
import { GetStandardsQueryDto } from './dto/get-standards-query.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Website - Thư viện Tiêu chuẩn')
@Controller('api/public/standards')
export class StandardsPublicController {
  constructor(private readonly standardsService: StandardsService) {}

  @Get()
  @ApiOperation({
    summary: 'Tra cứu danh sách Tiêu chuẩn/Quy chuẩn',
    description: 'Hỗ trợ tìm kiếm theo Mã Tiêu chuẩn (VD: QCVN 40) và Tên.',
  })
  async findAll(@Query() query: GetStandardsQueryDto) {
    return this.standardsService.findAllPublic(query);
  }
}
