// File: src/modules/categories/categories.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { GetCategoriesQueryDto } from './dto/get-categories-query.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: {
        ...dto,
        order: dto.order ?? 0,
        is_active: dto.is_active ?? true,
      },
    });
  }

  async findAll(query: GetCategoriesQueryDto) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'order',
      order = 'ASC',
      type,
      status,
      search,
      lang = 'vi',
    } = query;
    const skip = (page - 1) * limit;

    // 1. Xây dựng điều kiện lọc cơ bản
    const where: Prisma.CategoryWhereInput = {};
    if (type) where.type = type;
    if (status !== undefined) where.is_active = status === 'true';

    // 2. Xử lý Search bằng JSONB Path (Đã sửa lỗi cú pháp path: ['zh'])
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

    // 3. Truy vấn dữ liệu
    const [data, total] = await Promise.all([
      this.prisma.category.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: order.toLowerCase() as 'asc' | 'desc' },
      }),
      this.prisma.category.count({ where }),
    ]);

    // 4. Mapping dữ liệu trả về theo ngôn ngữ yêu cầu
    const currentLang = lang as string;

    const mappedData = data.map((item) => {
      const nameObj = item.name_i18n as any;
      const descObj = item.desc_i18n as any;
      const seoObj = item.seo_i18n as any;

      return {
        ...item,
        name: nameObj[currentLang] || nameObj['vi'],
        description: descObj?.[currentLang] || descObj?.['vi'],
        seo: seoObj?.[currentLang] || seoObj?.['vi'],
      };
    });

    return {
      data: mappedData,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Không tìm thấy danh mục');
    return category;
  }

  async update(id: number, dto: UpdateCategoryDto) {
    return this.prisma.category.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.category.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }
}
