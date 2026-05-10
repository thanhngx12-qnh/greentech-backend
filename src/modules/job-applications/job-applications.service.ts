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
import { Prisma } from '@prisma/client';

@Injectable()
export class JobApplicationsService {
  constructor(
    private prisma: PrismaService,
    private mediaService: MediaService, // Tái sử dụng MediaService upload Cloudinary
    @InjectQueue('job-applications-queue') private queue: Queue,
  ) {}

  // --- PUBLIC: NỘP CV ---
  async submit(dto: SubmitApplicationDto, file: Express.Multer.File) {
    // 1. Kiểm tra Job có tồn tại và đang OPEN không
    const job = await this.prisma.job.findUnique({ where: { id: dto.job_id } });
    if (!job || job.status !== 'OPEN') {
      throw new BadRequestException({
        errorCode: 'JOB_CLOSED',
        message: 'Tin tuyển dụng không tồn tại hoặc đã hết hạn.',
      });
    }

    // 2. Validate định dạng file CV (Chỉ nhận PDF, DOC, DOCX)
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
      // 3. Upload CV lên Cloudinary
      const cvUrl = await this.mediaService.uploadFile(file);

      // 4. Lưu vào Database
      const application = await this.prisma.jobApplication.create({
        data: {
          job: { connect: { id: dto.job_id } },
          full_name: dto.full_name,
          email: dto.email,
          phone: dto.phone,
          message: dto.message,
          cv_url: cvUrl, // Link Cloudinary
          status: 'NEW',
        },
      });

      // 5. Quăng vào Hàng đợi (Queue) để gửi Email ngầm
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

  // --- ADMIN: QUẢN LÝ CV ---
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
        orderBy: { created_at: 'desc' }, // CV mới nhất xếp lên đầu
        include: {
          job: { select: { title_i18n: true } }, // Kèm theo tên của tin tuyển dụng
        },
      }),
      this.prisma.jobApplication.count({ where }),
    ]);

    // Map lại data cho đẹp
    const mappedData = data.map((app) => ({
      ...app,
      job_title: (app.job.title_i18n as any)?.vi || 'N/A',
      job: undefined, // Dọn dẹp object lồng
    }));

    return {
      data: mappedData,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async updateStatus(id: string, dto: UpdateApplicationStatusDto) {
    return this.prisma.jobApplication.update({
      where: { id },
      data: { status: dto.status },
    });
  }
}
