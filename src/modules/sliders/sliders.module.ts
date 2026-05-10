// File: src/modules/sliders/sliders.module.ts
import { Module } from '@nestjs/common';
import { SlidersService } from './sliders.service';
import { SlidersController } from './sliders.controller';
import { SlidersPublicController } from './sliders.public.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { MediaModule } from '../media/media.module'; // Để sau này Controller có thể dùng upload ảnh trực tiếp

@Module({
  imports: [PrismaModule, MediaModule],
  controllers: [SlidersController, SlidersPublicController],
  providers: [SlidersService],
})
export class SlidersModule {}
