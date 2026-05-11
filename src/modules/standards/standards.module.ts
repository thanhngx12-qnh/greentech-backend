// File: src/modules/standards/standards.module.ts
import { Module } from '@nestjs/common';
import { StandardsService } from './standards.service';
import { StandardsController } from './standards.controller';
import { StandardsPublicController } from './standards.public.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [PrismaModule, MediaModule],
  controllers: [StandardsController, StandardsPublicController],
  providers: [StandardsService],
})
export class StandardsModule {}
