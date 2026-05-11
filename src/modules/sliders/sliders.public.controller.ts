// File: src/modules/sliders/sliders.public.controller.ts
import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { SlidersService } from './sliders.service';
import { GetSlidersQueryDto } from './dto/get-sliders-query.dto';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('Website - Banner (Sliders)')
@Controller('api/public/sliders')
export class SlidersPublicController {
  constructor(private readonly slidersService: SlidersService) {}

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách banner theo vị trí (đã làm phẳng đa ngôn ngữ)',
    description:
      'API này trả về ảnh, tiêu đề, link tương ứng với ngôn ngữ yêu cầu. Rất nhẹ để tải trang chủ.',
  })
  @ApiQuery({
    name: 'position',
    required: true,
    description: 'Vị trí banner cần lấy',
    enum: [
      'HOME_TOP',
      'HOME_MIDDLE',
      'SERVICES_TOP',
      'NEWS_TOP',
      'CONTACT_TOP',
    ],
  })
  @ApiQuery({
    name: 'lang',
    required: false,
    description: 'Ngôn ngữ hiển thị (vi, en, zh)',
  })
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
