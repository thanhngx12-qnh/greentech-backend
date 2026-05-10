// File: src/modules/job-applications/job-applications.service.ts
import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MediaService } from '../media/media.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { SubmitApplicationDto } from './dto/submit-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { GetApplicationsQueryDto } from './dto/get-applications-query.dto';
import { ExportApplicationsQueryDto } from './dto/export-applications-query.dto'; // <-- IMPORT DTO MỚI
import { Prisma } from '@prisma/client';
import { Parser } from 'json2csv'; // <-- IMPORT PARSER
import { AuditLogsService } from '../audit-logs/audit-logs.service'; // <-- IMPORT AUDIT LOG

@Injectable()
export class JobApplicationsService {
  constructor(
    private prisma: PrismaService,
    private mediaService: MediaService,
    private auditLogsService: AuditLogsService, // <-- INJECT AUDIT LOG
    @InjectQueue('job-applications-queue') private queue: Queue,
  ) {}

  // --- PUBLIC: NỘP CV (Giữ nguyên logic cũ) ---
  async submit(dto: SubmitApplicationDto, file: Express.Multer.File) {
    const job = await this.prisma.job.findUnique({ where: { id: dto.job_id } });
    if (!job || job.status !== 'OPEN') {
      throw new BadRequestException({
        errorCode: 'JOB_CLOSED',
        message: 'Tin tuyển dụng không tồn tại hoặc đã hết hạn.',
      });
    }

    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException({
        errorCode: 'INVALID_FILE_TYPE',
        message: 'Chỉ chấp nhận file CV định dạng PDF hoặc Word.',
      });
    }

    try {
      const cvUrl = await this.mediaService.uploadFile(file);

      const application = await this.prisma.jobApplication.create({
        data: {
          job: { connect: { id: dto.job_id } },
          full_name: dto.full_name,
          email: dto.email,
          phone: dto.phone,
          message: dto.message,
          cv_url: cvUrl,
          status: 'NEW',
        },
      });

      await this.queue.add('process-new-cv', {
        applicationId: application.id,
        candidateName: application.full_name,
        email: application.email,
        jobTitle: (job.title_i18n as any)?.vi || 'Vị trí tuyển dụng',
      });

      return { message: 'Nộp hồ sơ thành công! HR sẽ sớm liên hệ với bạn.' };
    } catch (error) {
      console.error('Submit CV Error:', error);
      throw new InternalServerErrorException(
        'Lỗi hệ thống khi nộp hồ sơ, vui lòng thử lại sau.',
      );
    }
  }

  // --- ADMIN: QUẢN LÝ DANH SÁCH CV ---
  async findAll(query: GetApplicationsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.JobApplicationWhereInput = {};
    if (query.job_id) where.job_id = query.job_id;
    if (query.status) where.status = query.status;
    if (query.search) {
      where.OR = [
        { full_name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.jobApplication.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          job: { select: { title_i18n: true } },
        },
      }),
      this.prisma.jobApplication.count({ where }),
    ]);

    const mappedData = data.map((app) => ({
      ...app,
      job_title: (app.job.title_i18n as any)?.vi || 'N/A',
      job: undefined,
    }));

    return {
      data: mappedData,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // 🎯 CẬP NHẬT: Thêm currentUserId để ghi Audit Log
  async updateStatus(
    id: string,
    dto: UpdateApplicationStatusDto,
    currentUserId: string,
  ) {
    const existing = await this.prisma.jobApplication.findUnique({
      where: { id },
    });
    if (!existing)
      throw new BadRequestException('Không tìm thấy hồ sơ ứng viên');

    const updated = await this.prisma.jobApplication.update({
      where: { id },
      data: { status: dto.status },
    });

    // Ghi log hành động HR cập nhật trạng thái ứng viên
    this.auditLogsService.logChange(
      currentUserId,
      'UPDATE',
      'JOB_POSTINGS',
      id,
      existing,
      { status: dto.status },
    );

    return updated;
  }

  // --- 🎯 ADMIN METHOD: XUẤT FILE CSV HỒ SƠ ỨNG VIÊN ---
  async exportToCsv(query: ExportApplicationsQueryDto, currentUserId: string) {
    const { job_id, status, startDate, endDate, lang = 'vi' } = query;

    const where: Prisma.JobApplicationWhereInput = {};
    if (job_id) where.job_id = job_id;
    if (status) where.status = status;
    if (startDate || endDate) {
      where.created_at = {
        gte: startDate ? new Date(startDate) : undefined,
        lte: endDate ? new Date(endDate) : undefined,
      };
    }

    const applications = await this.prisma.jobApplication.findMany({
      where,
      orderBy: { created_at: 'desc' },
      include: { job: { select: { title_i18n: true } } },
    });

    // Định nghĩa các cột cho file Excel ứng viên
    const fields = [
      {
        label: lang === 'vi' ? 'Ngày nộp' : 'Date',
        value: (row: any) => row.created_at.toLocaleString('vi-VN'),
      },
      {
        label: lang === 'vi' ? 'Họ tên ứng viên' : 'Candidate Name',
        value: 'full_name',
      },
      { label: 'Email', value: 'email' },
      { label: lang === 'vi' ? 'Số điện thoại' : 'Phone', value: 'phone' },
      {
        label: lang === 'vi' ? 'Vị trí ứng tuyển' : 'Applied Position',
        value: (row: any) => (row.job.title_i18n as any)?.vi || 'N/A',
      },
      { label: lang === 'vi' ? 'Trạng thái' : 'Status', value: 'status' },
      { label: lang === 'vi' ? 'Lời nhắn' : 'Message', value: 'message' },
      {
        label: lang === 'vi' ? 'Link CV (Cloudinary)' : 'CV Link',
        value: 'cv_url',
      },
    ];

    try {
      const json2csvParser = new Parser({ fields, withBOM: true });
      const csv = json2csvParser.parse(applications);

      // Ghi Audit Log hành động xuất dữ liệu nhạy cảm của ứng viên
      this.auditLogsService.logChange(
        currentUserId,
        'UPDATE',
        'JOB_POSTINGS',
        'ALL',
        null,
        { action: 'EXPORT_APPLICATIONS_CSV', filters: query },
      );

      return csv;
    } catch (error) {
      console.error('Export Applications CSV Error:', error);
      throw new InternalServerErrorException(
        'Lỗi khi xuất file danh sách ứng viên',
      );
    }
  }
}
