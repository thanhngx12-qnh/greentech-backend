// File: src/modules/leads/leads.service.ts
import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadStatusDto } from './dto/update-lead-status.dto';
import { ExportLeadsQueryDto } from './dto/export-leads-query.dto'; // <-- IMPORT DTO MỚI
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Parser } from 'json2csv'; // <-- IMPORT THƯ VIỆN EXPORT
import { AuditLogsService } from '../audit-logs/audit-logs.service'; // <-- IMPORT AUDIT LOG

@Injectable()
export class LeadsService {
  constructor(
    private prisma: PrismaService,
    private auditLogsService: AuditLogsService, // <-- INJECT AUDIT LOG
    @InjectQueue('lead-notifications') private leadQueue: Queue,
  ) {}

  // --- PUBLIC METHOD: Khách gửi form ---
  async submitForm(dto: CreateLeadDto) {
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

    const newLead = await this.prisma.lead.create({ data: dto });

    const jobData = {
      leadId: newLead.id,
      email: newLead.email,
      full_name: newLead.full_name,
    };
    await this.leadQueue.add('send-admin-email', jobData);
    await this.leadQueue.add('send-customer-thankyou', jobData);
    await this.leadQueue.add('send-zalo-webhook', jobData);

    return {
      message:
        'Cảm ơn bạn! Chúng tôi đã nhận được yêu cầu và sẽ liên hệ sớm nhất.',
    };
  }

  // --- ADMIN METHOD: Lấy danh sách ---
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
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.lead.count({ where }),
    ]);

    return { data, meta: { total, page: Number(page), limit: Number(limit) } };
  }

  // --- ADMIN METHOD: Cập nhật trạng thái ---
  async updateStatus(
    id: string,
    dto: UpdateLeadStatusDto,
    currentUserId: string,
  ) {
    const existing = await this.prisma.lead.findUnique({ where: { id } });
    if (!existing) throw new BadRequestException('Không tìm thấy Lead');

    const updated = await this.prisma.lead.update({
      where: { id },
      data: { status: dto.status },
    });

    // Ghi log thay đổi trạng thái khách hàng
    this.auditLogsService.logChange(
      currentUserId,
      'UPDATE',
      'LEADS',
      id,
      existing,
      { status: dto.status },
    );

    return updated;
  }

  // --- 🎯 ADMIN METHOD: XUẤT FILE CSV ---
  async exportToCsv(query: ExportLeadsQueryDto, currentUserId: string) {
    const { status, startDate, endDate, lang = 'vi' } = query;

    // 1. Xây dựng bộ lọc thời gian
    const where: any = {};
    if (status) where.status = status;
    if (startDate || endDate) {
      where.created_at = {
        gte: startDate ? new Date(startDate) : undefined,
        lte: endDate ? new Date(endDate) : undefined,
      };
    }

    // 2. Lấy dữ liệu
    const leads = await this.prisma.lead.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });

    // 3. Định nghĩa tiêu đề cột cho Excel theo ngôn ngữ
    const fields = [
      {
        label: lang === 'vi' ? 'Ngày gửi' : 'Date',
        value: (row: any) => row.created_at.toLocaleString('vi-VN'),
      },
      { label: lang === 'vi' ? 'Họ tên' : 'Full Name', value: 'full_name' },
      { label: 'Email', value: 'email' },
      { label: lang === 'vi' ? 'Số điện thoại' : 'Phone', value: 'phone' },
      { label: lang === 'vi' ? 'Công ty' : 'Company', value: 'company_name' },
      { label: lang === 'vi' ? 'Trạng thái' : 'Status', value: 'status' },
      { label: lang === 'vi' ? 'Nội dung' : 'Content', value: 'content' },
      { label: lang === 'vi' ? 'Nguồn (UTM)' : 'Source', value: 'utm_source' },
    ];

    try {
      // 4. Chuyển đổi sang CSV với tùy chọn BOM (Byte Order Mark) để Excel đọc được tiếng Việt
      const json2csvParser = new Parser({ fields, withBOM: true });
      const csv = json2csvParser.parse(leads);

      // 5. Ghi Audit Log hành động xuất dữ liệu (Bảo mật)
      this.auditLogsService.logChange(
        currentUserId,
        'UPDATE',
        'LEADS',
        'ALL',
        null,
        { action: 'EXPORT_CSV', filters: query },
      );

      return csv;
    } catch (error) {
      console.error('Export CSV Error:', error);
      throw new InternalServerErrorException('Lỗi khi xuất file dữ liệu');
    }
  }
}
