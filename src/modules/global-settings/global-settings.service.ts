// File: src/modules/global-settings/global-settings.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class GlobalSettingsService {
  constructor(
    private prisma: PrismaService,
    private auditLogsService: AuditLogsService,
  ) {}

  // ========================================================
  // --- ADMIN METHODS ---
  // ========================================================

  /**
   * Cập nhật (hoặc Tạo mới nếu chưa có) một cài đặt
   */
  async updateSetting(dto: UpdateSettingDto, currentUserId: string) {
    const { key, value } = dto;

    const existing = await this.prisma.globalSetting.findUnique({
      where: { key },
    });

    try {
      const updated = await this.prisma.globalSetting.upsert({
        where: { key },
        update: { value: value as Prisma.InputJsonValue },
        create: { key, value: value as Prisma.InputJsonValue },
      });

      // 🎯 BẮN LOG: Ghi lại hành động thay đổi Cài đặt quan trọng
      this.auditLogsService.logChange(
        currentUserId,
        existing ? 'UPDATE' : 'CREATE',
        'SETTINGS', // Bạn cần thêm 'SETTINGS' vào Enum trong AuditLogsService
        key,
        existing?.value,
        value,
      );

      return updated;
    } catch (error) {
      console.error('Update Setting Error:', error);
      throw new InternalServerErrorException('Không thể cập nhật cài đặt');
    }
  }

  // ========================================================
  // --- PUBLIC METHODS (Cho Website) ---
  // ========================================================

  /**
   * Lấy ra một hoặc nhiều cài đặt và trả về dưới dạng object phẳng
   * VD: getSettings(['hotline', 'company_name'], 'vi')
   * Kết quả: { "hotline": "0987654321", "company_name": "Tên Cty Tiếng Việt" }
   */
  async getSettings(keys: string[], lang: string = 'vi') {
    const settings = await this.prisma.globalSetting.findMany({
      where: { key: { in: keys } },
    });

    // Biến đổi từ mảng [{key, value}, ...] thành một object { key1: value1, key2: value2 }
    const result = settings.reduce(
      (acc, setting) => {
        const settingValue = setting.value as any;

        // Nếu giá trị là object và có key ngôn ngữ (VD: {"vi": "...", "en": "..."})
        // thì bóc tách đúng ngôn ngữ đó ra
        if (
          typeof settingValue === 'object' &&
          settingValue !== null &&
          settingValue[lang]
        ) {
          acc[setting.key] = settingValue[lang];
        }
        // Nếu không có key ngôn ngữ, hoặc ngôn ngữ đó chưa được nhập, thì fallback về tiếng Việt
        else if (
          typeof settingValue === 'object' &&
          settingValue !== null &&
          settingValue['vi']
        ) {
          acc[setting.key] = settingValue['vi'];
        }
        // Nếu giá trị chỉ là một object đơn giản (VD: {"value": "0987..."})
        else if (
          typeof settingValue === 'object' &&
          settingValue !== null &&
          settingValue['value']
        ) {
          acc[setting.key] = settingValue['value'];
        }
        // Nếu không phải object, lấy nguyên giá trị (ít dùng)
        else {
          acc[setting.key] = settingValue;
        }
        return acc;
      },
      {} as Record<string, any>,
    );

    return result;
  }
}
