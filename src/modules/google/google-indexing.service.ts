// File: src/modules/google/google-indexing.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { google } from 'googleapis';
import { GlobalSettingsService } from '../global-settings/global-settings.service';

@Injectable()
export class GoogleIndexingService {
  constructor(private settingsService: GlobalSettingsService) {}

  /**
   * Gửi yêu cầu Index URL lên Google Search Console
   * @param urls - Mảng các URL cần được Google index
   */
  async requestIndexing(urls: string[]) {
    console.log('[GOOGLE INDEXING] Bắt đầu yêu cầu index cho:', urls);

    const settings = await this.settingsService.getSettings([
      'google_service_account_json',
    ]);
    const serviceAccountJson = settings.google_service_account_json?.value;

    if (!serviceAccountJson) {
      console.error(
        '[GOOGLE INDEXING] Lỗi: Chưa cấu hình google_service_account_json trong Cài đặt.',
      );
      return;
    }

    try {
      const credentials = JSON.parse(serviceAccountJson);

      // 🎯 SỬA LỖI TẠI ĐÂY: Dùng cú pháp mới của googleapis để tạo JWT Client
      const jwtClient = new google.auth.JWT({
        email: credentials.client_email,
        key: credentials.private_key,
        scopes: ['https://www.googleapis.com/auth/indexing'],
      });

      const indexing = google.indexing({ version: 'v3', auth: jwtClient });

      for (const url of urls) {
        const result = await indexing.urlNotifications.publish({
          requestBody: {
            url: url,
            type: 'URL_UPDATED',
          },
        });

        if (result.status === 200) {
          console.log(`[GOOGLE INDEXING] ✅ Gửi thành công URL: ${url}`);
        } else {
          console.error(
            `[GOOGLE INDEXING] ❌ Gửi thất bại URL: ${url}`,
            result.data,
          );
        }
        await new Promise((res) => setTimeout(res, 500));
      }
    } catch (error) {
      console.error(
        '[GOOGLE INDEXING] Lỗi nghiêm trọng khi thực thi:',
        error.message,
      );
    }
  }
}
