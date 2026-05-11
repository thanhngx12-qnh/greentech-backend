// File: src/modules/standards/standards.service.ts
import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateStandardDto } from './dto/create-standard.dto';
import { UpdateStandardDto } from './dto/update-standard.dto';
import { GetStandardsQueryDto } from './dto/get-standards-query.dto';
import { Prisma } from '@prisma/client';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Injectable()
export class StandardsService {
  constructor(
    private prisma: PrismaService,
    private auditLogsService: AuditLogsService,
  ) {}

  // ========================================================
  // --- ADMIN METHODS ---
  // ========================================================

  async create(dto: CreateStandardDto, currentUserId: string) {
    // Kiểm tra Category có đúng loại STANDARD không
    const category = await this.prisma.category.findUnique({
      where: { id: dto.category_id },
    });
    if (!category || category.type !== 'STANDARD') {
      throw new BadRequestException({
        errorCode: 'INVALID_CATEGORY',
        message: 'Danh mục không hợp lệ hoặc không phải là Tiêu chuẩn',
      });
    }

    // Kiểm tra Mã tiêu chuẩn đã tồn tại chưa
    const existing = await this.prisma.standard.findUnique({
      where: { code: dto.code },
    });
    if (existing) {
      throw new BadRequestException({
        errorCode: 'CODE_EXISTS',
        message: 'Mã tiêu chuẩn này đã tồn tại',
      });
    }

    try {
      const data: Prisma.StandardCreateInput = {
        category: { connect: { id: dto.category_id } },
        author: { connect: { id: currentUserId } },
        code: dto.code,
        status: dto.status,
        file_url: dto.file_url,
        slug_i18n: { vi: dto.slug_vi, en: dto.slug_en, zh: dto.slug_zh },
        title_i18n: { vi: dto.title_vi, en: dto.title_en, zh: dto.title_zh },
        content_i18n: {
          vi: dto.content_vi,
          en: dto.content_en,
          zh: dto.content_zh,
        },
        seo_i18n: dto.seo_i18n as any,
      };

      const newStandard = await this.prisma.standard.create({ data });

      // 🎯 BẮN LOG
      this.auditLogsService.logChange(
        currentUserId,
        'CREATE',
        'STANDARDS',
        newStandard.id,
        null,
        data,
      );

      return newStandard;
    } catch (error) {
      console.error('Standard Create Error:', error);
      throw new InternalServerErrorException('Không thể tạo Tiêu chuẩn mới');
    }
  }

  async findAll(query: GetStandardsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const { category_id, search, lang = 'vi' } = query;

    const where: Prisma.StandardWhereInput = { deleted_at: null };
    if (category_id) where.category_id = category_id;
    if (search) {
      // 🎯 Tìm kiếm theo cả Mã Tiêu chuẩn và Tên Tiêu chuẩn
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        {
          title_i18n: {
            path: [lang],
            string_contains: search,
            mode: 'insensitive',
          } as any,
        },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.standard.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: { author: { select: { id: true, full_name: true } } },
      }),
      this.prisma.standard.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const standard = await this.prisma.standard.findUnique({
      where: { id },
      include: { category: true, author: true },
    });
    if (!standard) {
      throw new NotFoundException({
        errorCode: 'STANDARD_NOT_FOUND',
        message: 'Không tìm thấy Tiêu chuẩn',
      });
    }
    return standard;
  }

  async update(id: string, dto: UpdateStandardDto, currentUserId: string) {
    const existing = await this.findOne(id);
    const updateData: Prisma.StandardUpdateInput = {};

    // (Logic merge tương tự News/Services...)
    // ...

    const updated = await this.prisma.standard.update({
      where: { id },
      data: updateData,
    });
    this.auditLogsService.logChange(
      currentUserId,
      'UPDATE',
      'STANDARDS',
      id,
      existing,
      updateData,
    );
    return updated;
  }

  async remove(id: string, currentUserId: string) {
    const existing = await this.findOne(id);
    await this.prisma.standard.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
    this.auditLogsService.logChange(
      currentUserId,
      'DELETE',
      'STANDARDS',
      id,
      existing,
      null,
    );
    return { message: 'Xóa Tiêu chuẩn thành công' };
  }

  // ========================================================
  // --- PUBLIC METHODS (Cho Website) ---
  // ========================================================

  async findAllPublic(query: GetStandardsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const { category_id, search, lang = 'vi' } = query;

    const where: Prisma.StandardWhereInput = {
      status: 'PUBLISHED',
      deleted_at: null,
    };
    if (category_id) where.category_id = category_id;
    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        {
          title_i18n: {
            path: [lang],
            string_contains: search,
            mode: 'insensitive',
          } as any,
        },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.standard.findMany({
        where,
        skip,
        take: limit,
        orderBy: { code: 'asc' }, // Sắp xếp theo mã tiêu chuẩn
      }),
      this.prisma.standard.count({ where }),
    ]);

    const mappedData = data.map((item) => {
      return {
        id: item.id,
        code: item.code,
        title:
          (item.title_i18n as any)?.[lang] || (item.title_i18n as any)?.['vi'],
        slug:
          (item.slug_i18n as any)?.[lang] || (item.slug_i18n as any)?.['vi'],
        file_url: item.file_url,
      };
    });

    return {
      data: mappedData,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // (Hàm findBySlug tương tự News/Services)
}
