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
import { BulkUpdateSettingsDto } from './dto/bulk-update-settings.dto'; // <-- IMPORT MỚI
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
  @ApiOperation({ summary: 'Lấy một hoặc nhiều cài đặt (dạng thô)' })
  @ApiQuery({
    name: 'keys',
    description: 'Các key cần lấy, cách nhau bằng dấu phẩy',
    example: 'hotline,contact_email',
  })
  @ApiQuery({ name: 'lang', required: false })
  async getSettings(@Query('keys') keys: string, @Query('lang') lang: string) {
    const keysArray = keys ? keys.split(',') : [];
    return this.settingsService.getSettings(keysArray, lang);
  }

  @Put()
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Cập nhật MỘT cài đặt (upsert)',
    deprecated: true, // 🎯 Đánh dấu API này là cũ, khuyến khích dùng /bulk
  })
  updateSetting(@Body() dto: UpdateSettingDto, @Request() req: any) {
    return this.settingsService.updateSetting(dto, req.user.userId);
  }

  // 🎯 API MỚI: Cập nhật hàng loạt, tối ưu và an toàn
  @Put('bulk')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Cập nhật HÀNG LOẠT cài đặt trong một lần gọi' })
  bulkUpdate(@Body() dto: BulkUpdateSettingsDto, @Request() req: any) {
    return this.settingsService.bulkUpdate(dto, req.user.userId);
  }
}
