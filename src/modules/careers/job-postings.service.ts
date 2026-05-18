// File: src/modules/careers/job-postings.service.ts
import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateJobPostingDto } from './dto/create-job-posting.dto';
import { UpdateJobPostingDto } from './dto/update-job-posting.dto';
import { GetJobPostingsQueryDto } from './dto/get-job-postings-query.dto';
import { Prisma } from '@prisma/client';
import { AuditLogsService } from '../audit-logs/audit-logs.service'; // <-- IMPORT AUDIT LOG
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class JobPostingsService {
  constructor(
    private prisma: PrismaService,
    private auditLogsService: AuditLogsService, // <-- INJECT AUDIT LOG
    @InjectQueue('indexing-queue') private indexingQueue: Queue,
  ) {}

  // ========================================================
  // --- ADMIN METHODS ---
  // ========================================================

  async create(dto: CreateJobPostingDto, currentUserId: string) {
    const category = await this.prisma.category.findUnique({
      where: { id: dto.category_id },
    });
    if (!category || category.type !== 'JOB') {
      throw new BadRequestException({
        errorCode: 'INVALID_CATEGORY',
        message: 'Danh mục không hợp lệ hoặc không phải là Tin tuyển dụng',
      });
    }

    try {
      const data: Prisma.JobCreateInput = {
        category: { connect: { id: dto.category_id } },
        author: { connect: { id: currentUserId } },
        slug_i18n: { vi: dto.slug_vi, en: dto.slug_en, zh: dto.slug_zh },
        title_i18n: { vi: dto.title_vi, en: dto.title_en, zh: dto.title_zh },
        description_i18n: {
          vi: dto.description_vi,
          en: dto.description_en,
          zh: dto.description_zh,
        },
        requirements_i18n: (dto.requirements_i18n as any) || {},
        benefits_i18n: (dto.benefits_i18n as any) || {},
        location: dto.location || '',
        salary_range: dto.salary_range,
        type: dto.type,
        status: dto.status,
        deadline: dto.deadline ? new Date(dto.deadline) : undefined,
        seo_i18n: dto.seo_i18n as any,
      };

      const newJob = await this.prisma.job.create({ data });

      // 🎯 LOGIC MỚI: Đẩy vào Queue nếu tin tuyển dụng được mở
      if (dto.is_index_request && newJob.status === 'OPEN') {
        const slugs = newJob.slug_i18n as any;
        const baseUrl =
          process.env.FRONTEND_BASE_URL || 'http://localhost:3001';
        const urls_to_index = Object.keys(slugs)
          .map((lang) =>
            slugs[lang] ? `${baseUrl}/${lang}/careers/${slugs[lang]}` : null,
          )
          .filter(Boolean);

        if (urls_to_index.length > 0) {
          await this.indexingQueue.add('request-indexing', {
            urls: urls_to_index,
          });
          console.log(
            '[INDEXING QUEUE] Đã thêm Job index cho Tin tuyển dụng mới:',
            newJob.id,
          );
        }
      }

      // Ghi Audit Log
      this.auditLogsService.logChange(
        currentUserId,
        'CREATE',
        'JOB_POSTINGS',
        newJob.id,
        null,
        data,
      );

      return newJob;
    } catch (error) {
      console.error('Job Create Error:', error);
      throw new InternalServerErrorException('Không thể tạo tin tuyển dụng');
    }
  }

  async findAll(query: GetJobPostingsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const {
      sortBy = 'created_at',
      order = 'desc',
      status,
      type,
      location,
      search,
      lang = 'vi',
    } = query;

    const skip = (page - 1) * limit;
    const where: Prisma.JobWhereInput = { deleted_at: null };

    if (status) where.status = status;
    if (type) where.type = type;
    if (location) where.location = { contains: location, mode: 'insensitive' };

    // 🎯 HYBRID SEARCH ĐỂ BẮT TIẾNG VIỆT
    let [data, total] = await Promise.all([
      this.prisma.job.findMany({
        where,
        skip: search ? undefined : skip,
        take: search ? undefined : limit,
        orderBy: { [sortBy as string]: order },
        include: { author: { select: { id: true, full_name: true } } },
      }),
      this.prisma.job.count({ where }),
    ]);

    if (search) {
      const term = search.toLowerCase().trim();
      const currentLang = lang as string;
      data = data.filter((item) => {
        const title =
          (item.title_i18n as any)?.[currentLang]?.toLowerCase() || '';
        const desc =
          (item.description_i18n as any)?.[currentLang]?.toLowerCase() || '';
        return title.includes(term) || desc.includes(term);
      });
      total = data.length;
      data = data.slice(skip, skip + limit);
    }

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: {
        category: true,
        author: { select: { id: true, full_name: true, email: true } },
      },
    });
    if (!job) {
      throw new NotFoundException({
        errorCode: 'JOB_NOT_FOUND',
        message: 'Không tìm thấy tin tuyển dụng',
      });
    }
    return job;
  }

  async update(id: string, dto: UpdateJobPostingDto, currentUserId: string) {
    const existing = await this.findOne(id);
    const updateData: Prisma.JobUpdateInput = {};

    if (dto.status) updateData.status = dto.status;
    if (dto.location) updateData.location = dto.location;
    if (dto.type) updateData.type = dto.type;
    if (dto.salary_range !== undefined)
      updateData.salary_range = dto.salary_range;
    if (dto.deadline) updateData.deadline = new Date(dto.deadline);
    if (dto.category_id)
      updateData.category = { connect: { id: dto.category_id } };

    if (dto.slug_vi || dto.slug_en || dto.slug_zh) {
      updateData.slug_i18n = {
        vi: dto.slug_vi ?? (existing.slug_i18n as any).vi,
        en: dto.slug_en ?? (existing.slug_i18n as any).en,
        zh: dto.slug_zh ?? (existing.slug_i18n as any).zh,
      } as any;
    }
    if (dto.title_vi || dto.title_en || dto.title_zh) {
      updateData.title_i18n = {
        vi: dto.title_vi ?? (existing.title_i18n as any).vi,
        en: dto.title_en ?? (existing.title_i18n as any).en,
        zh: dto.title_zh ?? (existing.title_i18n as any).zh,
      } as any;
    }
    if (dto.description_vi || dto.description_en || dto.description_zh) {
      updateData.description_i18n = {
        vi: dto.description_vi ?? (existing.description_i18n as any).vi,
        en: dto.description_en ?? (existing.description_i18n as any).en,
        zh: dto.description_zh ?? (existing.description_i18n as any).zh,
      } as any;
    }

    if (dto.requirements_i18n)
      updateData.requirements_i18n = dto.requirements_i18n as any;
    if (dto.benefits_i18n) updateData.benefits_i18n = dto.benefits_i18n as any;
    if (dto.seo_i18n) updateData.seo_i18n = dto.seo_i18n as any;

    try {
      const updatedJob = await this.prisma.job.update({
        where: { id },
        data: updateData,
      });

      // 🎯 LOGIC MỚI: Đẩy vào Queue nếu tin tuyển dụng được cập nhật sang trạng thái MỞ
      if (dto.is_index_request && updatedJob.status === 'OPEN') {
        const slugs = updatedJob.slug_i18n as any;
        const baseUrl =
          process.env.FRONTEND_BASE_URL || 'http://localhost:3001';
        const urls_to_index = Object.keys(slugs)
          .map((lang) =>
            slugs[lang] ? `${baseUrl}/${lang}/careers/${slugs[lang]}` : null,
          )
          .filter(Boolean);

        if (urls_to_index.length > 0) {
          await this.indexingQueue.add('request-indexing', {
            urls: urls_to_index,
          });
          console.log(
            '[INDEXING QUEUE] Đã thêm Job index cho Tin tuyển dụng vừa cập nhật:',
            updatedJob.id,
          );
        }
      }

      // Ghi Audit Log
      this.auditLogsService.logChange(
        currentUserId,
        'UPDATE',
        'JOB_POSTINGS',
        id,
        existing,
        updateData,
      );

      return updatedJob;
    } catch (e) {
      throw new InternalServerErrorException('Cập nhật thất bại');
    }
  }

  async remove(id: string, currentUserId: string) {
    // <-- THÊM currentUserId
    const existing = await this.findOne(id);
    const deletedJob = await this.prisma.job.update({
      where: { id },
      data: { deleted_at: new Date() },
    });

    // 🎯 BẮN LOG: Hành động XÓA
    this.auditLogsService.logChange(
      currentUserId,
      'DELETE',
      'JOB_POSTINGS',
      id,
      existing,
      null,
    );

    return deletedJob;
  }

  // ========================================================
  // --- PUBLIC METHODS (Cho Website) ---
  // ========================================================

  async findBySlug(slug: string, lang: string) {
    const job = await this.prisma.job.findFirst({
      where: {
        status: 'OPEN',
        deleted_at: null,
        slug_i18n: { path: [lang], equals: slug } as any,
      },
      include: {
        category: true,
        author: { select: { id: true, full_name: true } },
      },
    });

    if (!job) {
      throw new NotFoundException({
        errorCode: 'JOB_NOT_FOUND',
        message: 'Tin tuyển dụng không tồn tại hoặc đã hết hạn',
      });
    }

    const currentLang = lang as string;
    const titleObj = job.title_i18n as any;
    const descObj = job.description_i18n as any;
    const reqObj = job.requirements_i18n as any;
    const benObj = job.benefits_i18n as any;
    const seoObj = job.seo_i18n as any;
    const slugObj = job.slug_i18n as any;

    return {
      id: job.id,
      category: job.category,
      author: job.author,
      type: job.type,
      location: job.location,
      salary_range: job.salary_range,
      deadline: job.deadline,
      created_at: job.created_at,

      title: titleObj?.[currentLang] || titleObj?.['vi'],
      description: descObj?.[currentLang] || descObj?.['vi'],
      requirements: reqObj?.[currentLang] || reqObj?.['vi'],
      benefits: benObj?.[currentLang] || benObj?.['vi'],
      seo: seoObj?.[currentLang] || seoObj?.['vi'],
      slug: slugObj?.[currentLang] || slugObj?.['vi'],

      available_slugs: slugObj, // 🎯 BẢN ĐỒ SLUG CHO FRONTEND
    };
  }

  // 🎯 HÀM MỚI: BÓC TÁCH DỮ LIỆU ĐA NGÔN NGỮ CHO DANH SÁCH PUBLIC
  async findAllPublic(query: GetJobPostingsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const {
      sortBy = 'created_at',
      order = 'desc',
      type,
      location,
      lang = 'vi',
    } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.JobWhereInput = { status: 'OPEN', deleted_at: null };
    if (type) where.type = type;
    if (location) where.location = { contains: location, mode: 'insensitive' };

    const [data, total] = await Promise.all([
      this.prisma.job.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy as string]: order },
        include: { author: { select: { id: true, full_name: true } } },
      }),
      this.prisma.job.count({ where }),
    ]);

    const currentLang = lang as string;
    const mappedData = data.map((item) => {
      const titleObj = item.title_i18n as any;
      const descObj = item.description_i18n as any;
      const slugObj = item.slug_i18n as any;

      return {
        id: item.id,
        author: item.author,
        type: item.type,
        location: item.location,
        salary_range: item.salary_range,
        deadline: item.deadline,
        created_at: item.created_at,

        title: titleObj?.[currentLang] || titleObj?.['vi'],
        description: descObj?.[currentLang] || descObj?.['vi'],
        slug: slugObj?.[currentLang] || slugObj?.['vi'],
      };
    });

    return {
      data: mappedData,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
