// File: src/modules/leads/leads.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadStatusDto } from './dto/update-lead-status.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class LeadsService {
  constructor(
    private prisma: PrismaService,
    // Nhúng (Inject) cái hàng đợi Redis vào đây
    @InjectQueue('lead-notifications') private leadQueue: Queue,
  ) {}

  // --- PUBLIC METHOD (Cho Khách Hàng) ---
  async submitForm(dto: CreateLeadDto) {
    // 1. ANTI-SPAM (Chặn spam gửi liên tục 2 lần trong 5 phút từ cùng 1 email)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentLead = await this.prisma.lead.findFirst({
      where: {
        email: dto.email,
        created_at: { gte: fiveMinutesAgo },
      },
    });

    if (recentLead) {
      throw new BadRequestException({
        errorCode: 'TOO_MANY_REQUESTS',
        message: 'Bạn đã gửi yêu cầu gần đây. Vui lòng thử lại sau 5 phút.',
      });
    }

    // 2. Lưu vào Database (Cực nhanh)
    const newLead = await this.prisma.lead.create({
      data: dto,
    });

    // 3. ĐẨY VIỆC VÀO HÀNG ĐỢI (Queue)
    // Hệ thống ném job vào Redis và KHÔNG ĐỢI nó làm xong, chạy tiếp luôn
    const jobData = {
      leadId: newLead.id,
      email: newLead.email,
      full_name: newLead.full_name,
    };

    await this.leadQueue.add('send-admin-email', jobData);
    await this.leadQueue.add('send-customer-thankyou', jobData);
    await this.leadQueue.add('send-zalo-webhook', jobData);

    // 4. Trả về kết quả ngay lập tức cho Frontend
    return {
      message:
        'Cảm ơn bạn! Chúng tôi đã nhận được yêu cầu và sẽ liên hệ sớm nhất.',
    };
  }

  // --- ADMIN METHODS ---
  async findAll(query: any) {
    const { page = 1, limit = 20, status, search } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { full_name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company_name: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.lead.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { created_at: 'desc' }, // Mới nhất lên đầu
      }),
      this.prisma.lead.count({ where }),
    ]);

    return { data, meta: { total, page: Number(page), limit: Number(limit) } };
  }

  async updateStatus(id: string, dto: UpdateLeadStatusDto) {
    return this.prisma.lead.update({
      where: { id },
      data: { status: dto.status },
    });
  }
}
