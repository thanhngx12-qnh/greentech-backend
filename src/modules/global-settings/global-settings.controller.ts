// File: src/modules/global-settings/global-settings.controller.ts
import {
  Controller,
  Get,
  Put,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { GlobalSettingsService } from './global-settings.service';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Admin - Cài đặt chung (Global Settings)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/global-settings')
export class GlobalSettingsController {
  constructor(private readonly settingsService: GlobalSettingsService) {}

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Lấy danh sách cài đặt theo nhóm keys' })
  @ApiQuery({
    name: 'keys',
    description: 'Các key cần lấy, cách nhau bằng dấu phẩy',
    example: 'hotline,contact_email',
  })
  @ApiQuery({
    name: 'lang',
    required: false,
    description: 'Ngôn ngữ cần lấy (nếu có)',
    example: 'vi',
  })
  async getSettings(@Query('keys') keys: string, @Query('lang') lang: string) {
    // Chuyển chuỗi "key1,key2" thành mảng ['key1', 'key2']
    const keysArray = keys ? keys.split(',') : [];
    return this.settingsService.getSettings(keysArray, lang);
  }

  @Put()
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Cập nhật một cài đặt hệ thống' })
  updateSetting(@Body() dto: UpdateSettingDto, @Request() req: any) {
    return this.settingsService.updateSetting(dto, req.user.userId);
  }
}
