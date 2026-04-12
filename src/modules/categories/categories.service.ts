// File: src/modules/categories/categories.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  // Tạo mới danh mục
  async create(dto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: {
        ...dto,
        order: dto.order ?? 0,
        is_active: dto.is_active ?? true,
      },
    });
  }

  // Lấy danh sách (có phân trang, lọc, sắp xếp theo Checklist)
  async findAll(query: any) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'order',
      order = 'ASC',
      type,
      status,
      search,
    } = query;
    const skip = (page - 1) * limit;

    // 1. Xây dựng điều kiện lọc cơ bản cho Database
    const where: Prisma.CategoryWhereInput = {};
    if (type) where.type = type;
    if (status !== undefined) where.is_active = status === 'true';

    // 2. Truy vấn lấy dữ liệu từ DB
    // Lưu ý: Chúng ta lấy tất cả các bản ghi thỏa mãn điều kiện type/status (không dùng search ở đây để tránh lỗi JSONB)
    let data = await this.prisma.category.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { [sortBy]: order.toLowerCase() as 'asc' | 'desc' },
    });

    let total = await this.prisma.category.count({ where });

    // 3. Xử lý Search bằng JavaScript (Đảm bảo chính xác cho JSONB)
    if (search) {
      const searchTerm = search.toLowerCase();

      // Bước A: Lấy lại TẤT CẢ dữ liệu thỏa mãn type/status (không phân trang) để có thể filter chính xác
      // Nếu chúng ta chỉ filter trên cái 'data' đã phân trang (10 cái), thì nếu từ khóa nằm ở cái thứ 11, nó sẽ không bao giờ tìm thấy.
      const allData = await this.prisma.category.findMany({
        where,
      });

      // Bước B: Thực hiện lọc trên mảng đầy đủ
      const filteredData = allData.filter((cat: any) => {
        const nameVi = cat.name_i18n?.vi?.toLowerCase() || '';
        const descVi = cat.desc_i18n?.vi?.toLowerCase() || '';
        return nameVi.includes(searchTerm) || descVi.includes(searchTerm);
      });

      // Bước C: Tính toán lại Phân trang trên mảng đã được lọc
      total = filteredData.length; // Tổng số lượng thực tế sau khi search
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + Number(limit);

      data = filteredData.slice(startIndex, endIndex); // Cắt mảng theo phân trang
    }

    return {
      data,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
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
    await this.findOne(id);
    return this.prisma.category.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.category.update({
      where: { id },
      data: { deleted_at: new Date() }, // Soft Delete theo Checklist
    });
  }
}
