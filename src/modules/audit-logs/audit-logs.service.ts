// File: src/modules/audit-logs/audit-logs.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuditLogsService {
  constructor(private prisma: PrismaService) {}

  /**
   * HÀM GHI LOG (Chạy ngầm)
   */
  async logChange(
    userId: string,
    action: 'CREATE' | 'UPDATE' | 'DELETE',
    // 🎯 CẬP NHẬT: Thêm SLIDERS và STANDARDS vào danh sách cho phép
    moduleName:
      | 'NEWS'
      | 'SERVICES'
      | 'JOB_POSTINGS'
      | 'CATEGORIES'
      | 'LEADS'
      | 'SLIDERS'
      | 'STANDARDS',
    recordId: string,
    oldData?: any,
    newData?: any,
  ) {
    try {
      await this.prisma.auditLog.create({
        data: {
          user_id: userId,
          action: action,
          module: moduleName,
          record_id: String(recordId),
          // 🎯 SỬA LỖI Ở ĐÂY: Dùng undefined thay vì null cho trường JSON
          old_data: oldData ? (oldData as Prisma.InputJsonValue) : undefined,
          new_data: newData ? (newData as Prisma.InputJsonValue) : undefined,
        },
      });
    } catch (error) {
      console.error('⚠️ [AUDIT LOG ERROR] Không thể ghi log:', error);
    }
  }

  /**
   * HÀM XEM LOG (Dành cho Giám đốc/Super Admin)
   */
  async findAll(query: any) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const { module, action, user_id } = query;

    const where: Prisma.AuditLogWhereInput = {};
    if (module) where.module = module;
    if (action) where.action = action;
    if (user_id) where.user_id = user_id;

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' }, // Log mới nhất lên đầu
        include: {
          user: { select: { email: true, full_name: true } },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
