// File: src/modules/google/google.module.ts
import { Module } from '@nestjs/common'; // Bỏ import Global
import { GoogleIndexingService } from './google-indexing.service';
import { GlobalSettingsModule } from '../global-settings/global-settings.module';

// @Global() // <--- BỎ DÒNG NÀY
@Module({
  imports: [GlobalSettingsModule],
  providers: [GoogleIndexingService],
  exports: [GoogleIndexingService],
})
export class GoogleModule {}
