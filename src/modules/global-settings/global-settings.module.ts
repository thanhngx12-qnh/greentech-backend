// File: src/modules/global-settings/global-settings.module.ts
import { Module } from '@nestjs/common';
import { GlobalSettingsService } from './global-settings.service';
import { GlobalSettingsController } from './global-settings.controller';
import { GlobalSettingsPublicController } from './global-settings.public.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [GlobalSettingsController, GlobalSettingsPublicController],
  providers: [GlobalSettingsService],
  exports: [GlobalSettingsService], // <-- THÊM VÀO ĐÂY
})
export class GlobalSettingsModule {}
