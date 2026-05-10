// src/modules/careers/job-postings.service.ts
import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateJobPostingDto } from './dto/create-job-posting.dto';
import { UpdateJobPostingDto } from './dto/update-job-posting.dto';
import { GetJobPostingsQueryDto } from './dto/get-job-postings-query.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class JobPostingsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateJobPostingDto, authorId: string) {
    try {
      const data: Prisma.JobCreateInput = {
        category: { connect: { id: dto.category_id } },
        author: { connect: { id: authorId } },
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
      return await this.prisma.job.create({ data });
    } catch (error) {
      console.error(error);
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
    if (search) {
      where.OR = [
        {
          title_i18n: {
            path: [lang],
            string_contains: search,
            mode: 'insensitive',
          } as any,
        },
        {
          description_i18n: {
            path: [lang],
            string_contains: search,
            mode: 'insensitive',
          } as any,
        },
      ];
    }

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

    const mappedData = data.map((item) => {
      const currentLang = lang as string;
      return {
        ...item,
        title:
          (item.title_i18n as any)?.[currentLang] ||
          (item.title_i18n as any)?.['vi'],
      };
    });

    return {
      data: mappedData,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: { author: true },
    });
    if (!job) throw new NotFoundException('Không tìm thấy tin tuyển dụng');
    return job;
  }

  async update(id: string, dto: UpdateJobPostingDto) {
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

    return this.prisma.job.update({ where: { id }, data: updateData });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.job.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }

  async findBySlug(slug: string, lang: string) {
    return this.findOne(slug);
  }
}
