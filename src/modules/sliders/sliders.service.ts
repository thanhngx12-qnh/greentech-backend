// File: src/modules/sliders/sliders.service.ts
import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSliderDto } from './dto/create-slider.dto';
import { UpdateSliderDto } from './dto/update-slider.dto';
import { GetSlidersQueryDto } from './dto/get-sliders-query.dto';
import { Prisma } from '@prisma/client';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Injectable()
export class SlidersService {
  constructor(
    private prisma: PrismaService,
    private auditLogsService: AuditLogsService,
  ) {}

  // --- ADMIN METHODS ---

  async create(dto: CreateSliderDto, currentUserId: string) {
    try {
      // 🎯 Gom dữ liệu phẳng từ DTO vào cấu trúc JSONB đa ngôn ngữ hoàn chỉnh
      const content_i18n: any = {
        vi: {
          image_desktop: dto.image_desktop_vi,
          image_mobile: dto.image_mobile_vi || dto.image_desktop_vi,
          title: dto.title_vi,
          subtitle: dto.subtitle_vi,
          link: dto.link_url_vi,
        },
      };

      // Thêm tiếng Anh nếu có
      if (dto.image_desktop_en) {
        content_i18n.en = {
          image_desktop: dto.image_desktop_en,
          image_mobile: dto.image_mobile_en || dto.image_desktop_en,
          title: dto.title_en,
          subtitle: dto.subtitle_en,
          link: dto.link_url_en,
        };
      }

      // Thêm tiếng Trung nếu có
      if (dto.image_desktop_zh) {
        content_i18n.zh = {
          image_desktop: dto.image_desktop_zh,
          image_mobile: dto.image_mobile_zh || dto.image_desktop_zh,
          title: dto.title_zh,
          subtitle: dto.subtitle_zh,
          link: dto.link_url_zh,
        };
      }

      const newSlider = await this.prisma.slider.create({
        data: {
          name: dto.name,
          position: dto.position,
          is_active: dto.is_active ?? true,
          order: dto.order ?? 0,
          content_i18n: content_i18n,
        },
      });

      this.auditLogsService.logChange(
        currentUserId,
        'CREATE',
        'CATEGORIES',
        newSlider.id.toString(),
        null,
        content_i18n,
      );
      return newSlider;
    } catch (error) {
      console.error('Slider Create Error:', error);
      throw new InternalServerErrorException('Không thể tạo Slider');
    }
  }

  async findAll(query: GetSlidersQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.SliderWhereInput = { deleted_at: null };
    if (query.position) where.position = query.position;
    if (query.status !== undefined) where.is_active = query.status === 'true';

    const [data, total] = await Promise.all([
      this.prisma.slider.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ position: 'asc' }, { order: 'asc' }],
      }),
      this.prisma.slider.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: number) {
    const slider = await this.prisma.slider.findUnique({ where: { id } });
    if (!slider) throw new NotFoundException('Không tìm thấy Slider');
    return slider;
  }

  async update(id: number, dto: UpdateSliderDto, currentUserId: string) {
    const existing = await this.findOne(id);
    const oldContent = existing.content_i18n as any;

    // Logic merge JSONB thông minh
    const newContent = { ...oldContent };

    // Update từng locale nếu có dữ liệu gửi lên
    ['vi', 'en', 'zh'].forEach((lang) => {
      const imgKey = `image_desktop_${lang}` as keyof UpdateSliderDto;
      if (dto[imgKey]) {
        newContent[lang] = {
          ...newContent[lang],
          image_desktop: dto[imgKey],
          image_mobile:
            dto[`image_mobile_${lang}` as keyof UpdateSliderDto] || dto[imgKey],
          title: dto[`title_${lang}` as keyof UpdateSliderDto],
          subtitle: dto[`subtitle_${lang}` as keyof UpdateSliderDto],
          link: dto[`link_url_${lang}` as keyof UpdateSliderDto],
        };
      }
    });

    const updated = await this.prisma.slider.update({
      where: { id },
      data: {
        name: dto.name,
        position: dto.position,
        is_active: dto.is_active,
        order: dto.order,
        content_i18n: newContent,
      },
    });

    this.auditLogsService.logChange(
      currentUserId,
      'UPDATE',
      'CATEGORIES',
      id.toString(),
      existing,
      updated,
    );
    return updated;
  }

  async remove(id: number, currentUserId: string) {
    const existing = await this.findOne(id);
    await this.prisma.slider.update({
      where: { id },
      data: { deleted_at: new Date(), is_active: false },
    });
    this.auditLogsService.logChange(
      currentUserId,
      'DELETE',
      'CATEGORIES',
      id.toString(),
      existing,
      null,
    );
    return { message: 'Xóa thành công' };
  }

  // ========================================================
  // --- PUBLIC API: LÀM PHẲNG DỮ LIỆU ---
  // ========================================================

  async getPublicSliders(position: string, lang: string = 'vi') {
    const sliders = await this.prisma.slider.findMany({
      where: { position: position as any, is_active: true, deleted_at: null },
      orderBy: { order: 'asc' },
    });

    return sliders.map((item) => {
      const content =
        (item.content_i18n as any)?.[lang] ||
        (item.content_i18n as any)?.['vi'];
      return {
        id: item.id,
        position: item.position,
        // Dữ liệu đã được bóc tách phẳng lỳ
        image_desktop: content?.image_desktop,
        image_mobile: content?.image_mobile,
        title: content?.title || '',
        subtitle: content?.subtitle || '',
        link_url: content?.link || '',
      };
    });
  }
}
