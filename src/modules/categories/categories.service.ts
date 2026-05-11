// File: src/modules/categories/categories.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { GetCategoriesQueryDto } from './dto/get-categories-query.dto';
import { Prisma } from '@prisma/client';
import { AuditLogsService } from '../audit-logs/audit-logs.service'; // <-- IMPORT

@Injectable()
export class CategoriesService {
  constructor(
    private prisma: PrismaService,
    private auditLogsService: AuditLogsService, // <-- INJECT
  ) {}

  async create(dto: CreateCategoryDto, currentUserId: string) {
    // Kiểm tra slug đã tồn tại chưa
    const existing = await this.prisma.category.findUnique({
      where: { slug: dto.slug },
    });
    if (existing) {
      throw new BadRequestException({
        errorCode: 'SLUG_EXISTS',
        message: 'Đường dẫn (slug) này đã được sử dụng',
      });
    }

    try {
      const newCategory = await this.prisma.category.create({
        data: {
          ...dto,
          order: dto.order ?? 0,
          is_active: dto.is_active ?? true,
        },
      });

      // 🎯 BẮN LOG
      this.auditLogsService.logChange(
        currentUserId,
        'CREATE',
        'CATEGORIES',
        newCategory.id.toString(),
        null,
        dto,
      );

      return newCategory;
    } catch (error) {
      throw new InternalServerErrorException({
        errorCode: 'CREATE_FAILED',
        message: 'Không thể tạo danh mục mới',
      });
    }
  }

  async findAll(query: GetCategoriesQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const {
      sortBy = 'order',
      order = 'asc',
      type,
      status,
      search,
      lang = 'vi',
    } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.CategoryWhereInput = { deleted_at: null };
    if (type) where.type = type;
    if (status !== undefined) where.is_active = status === 'true';
    if (search) {
      where.OR = [
        {
          name_i18n: {
            path: ['vi'],
            string_contains: search,
            mode: 'insensitive',
          } as any,
        },
        {
          name_i18n: {
            path: ['en'],
            string_contains: search,
            mode: 'insensitive',
          } as any,
        },
        {
          name_i18n: {
            path: ['zh'],
            string_contains: search,
            mode: 'insensitive',
          } as any,
        },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.category.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy as string]: order },
      }),
      this.prisma.category.count({ where }),
    ]);

    const currentLang = lang as string;
    const mappedData = data.map((item) => {
      return {
        ...item,
        name:
          (item.name_i18n as any)?.[currentLang] ||
          (item.name_i18n as any)?.['vi'],
        description:
          (item.desc_i18n as any)?.[currentLang] ||
          (item.desc_i18n as any)?.['vi'],
        seo:
          (item.seo_i18n as any)?.[currentLang] ||
          (item.seo_i18n as any)?.['vi'],
      };
    });

    return {
      data: mappedData,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: number) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundException({
        errorCode: 'CATEGORY_NOT_FOUND',
        message: 'Không tìm thấy danh mục',
      });
    }
    return category;
  }

  async update(id: number, dto: UpdateCategoryDto, currentUserId: string) {
    const existing = await this.findOne(id);

    const updated = await this.prisma.category.update({
      where: { id },
      data: dto,
    });

    // 🎯 BẮN LOG
    this.auditLogsService.logChange(
      currentUserId,
      'UPDATE',
      'CATEGORIES',
      id.toString(),
      existing,
      dto,
    );

    return updated;
  }

  async remove(id: number, currentUserId: string) {
    const existing = await this.findOne(id);

    await this.prisma.category.update({
      where: { id },
      data: { deleted_at: new Date(), is_active: false },
    });

    // 🎯 BẮN LOG
    this.auditLogsService.logChange(
      currentUserId,
      'DELETE',
      'CATEGORIES',
      id.toString(),
      existing,
      null,
    );

    return { message: 'Xóa danh mục thành công' };
  }
}
