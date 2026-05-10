// File: src/modules/leads/leads.module.ts
import { Module } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { LeadsController } from './leads.controller';
import { LeadsPublicController } from './leads.public.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { BullModule } from '@nestjs/bullmq';
import { LeadProcessor } from './lead.processor'; // Import anh công nhân Worker

@Module({
  imports: [
    PrismaModule,
    // Đăng ký hàng đợi 'lead-notifications' với Redis
    BullModule.registerQueue({
      name: 'lead-notifications',
    }),
  ],
  controllers: [LeadsController, LeadsPublicController],
  providers: [LeadsService, LeadProcessor], // Đưa anh công nhân vào Provider
})
export class LeadsModule {}
