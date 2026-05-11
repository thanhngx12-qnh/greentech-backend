// File: src/modules/global-settings/global-settings.public.controller.ts
import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { GlobalSettingsService } from './global-settings.service';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('Website - Cài đặt chung')
@Controller('api/public/settings')
export class GlobalSettingsPublicController {
  constructor(private readonly settingsService: GlobalSettingsService) {}

  @Get()
  @ApiOperation({
    summary: 'Lấy các thông tin chung của website (Hotline, Email...)',
  })
  @ApiQuery({
    name: 'keys',
    required: true,
    description: 'Các key cần lấy, cách nhau bằng dấu phẩy',
    example: 'hotline,company_address',
  })
  @ApiQuery({ name: 'lang', required: false, example: 'vi' })
  async getPublicSettings(
    @Query('keys') keys: string,
    @Query('lang') lang: string,
  ) {
    if (!keys) {
      throw new BadRequestException('Vui lòng cung cấp các "keys" cần lấy');
    }
    const keysArray = keys.split(',');
    return this.settingsService.getSettings(keysArray, lang || 'vi');
  }
}
