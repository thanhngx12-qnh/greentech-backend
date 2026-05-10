// File: src/modules/sliders/sliders.public.controller.ts
import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { SlidersService } from './sliders.service';
import { GetSlidersQueryDto } from './dto/get-sliders-query.dto';

@Controller('api/public/sliders')
export class SlidersPublicController {
  constructor(private readonly slidersService: SlidersService) {}

  @Get()
  async getSliders(@Query() query: GetSlidersQueryDto) {
    if (!query.position) {
      throw new BadRequestException({
        errorCode: 'MISSING_POSITION',
        message: 'Vui lòng chọn vị trí banner cần lấy (position)',
      });
    }
    return this.slidersService.getPublicSliders(
      query.position,
      query.lang || 'vi',
    );
  }
}
