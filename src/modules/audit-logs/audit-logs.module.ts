// File: src/modules/audit-logs/audit-logs.module.ts
import { Global, Module } from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';
import { AuditLogsController } from './audit-logs.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Global() // Biến thành Global Module để mọi Module khác có thể dùng AuditLogsService mà không cần import lại
@Module({
  imports: [PrismaModule],
  controllers: [AuditLogsController],
  providers: [AuditLogsService],
  exports: [AuditLogsService], // Cho phép News, Services... gọi hàm logChange
})
export class AuditLogsModule {}
