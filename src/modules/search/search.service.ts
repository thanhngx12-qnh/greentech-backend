// File: src/modules/search/search.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GlobalSearchQueryDto } from './dto/global-search-query.dto';
import { NewsStatus, ServiceStatus, JobStatus } from '@prisma/client';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async globalSearch(query: GlobalSearchQueryDto) {
    const { keyword, lang = 'vi', limit = 5 } = query;
    const term = keyword.toLowerCase().trim();

    // 1. Lấy tất cả dữ liệu đang PUBLISHED (Chưa lọc từ khóa)
    const [allNews, allServices, allJobs] = await Promise.all([
      this.prisma.news.findMany({
        where: { status: NewsStatus.PUBLISHED, deleted_at: null },
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.service.findMany({
        where: {
          status: ServiceStatus.PUBLISHED,
          is_active: true,
          deleted_at: null,
        },
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.job.findMany({
        where: { status: JobStatus.OPEN, deleted_at: null },
        orderBy: { created_at: 'desc' },
      }),
    ]);

    // 2. Hàm lọc thông minh bằng JavaScript (Bao chuẩn Tiếng Việt có dấu)
    const filterData = (items: any[], fields: string[]) => {
      return items
        .filter((item) => {
          // Kiểm tra xem từ khóa có nằm trong bất kỳ trường nào (title, content) không
          return fields.some((field) => {
            const text = (item[field] as any)?.[lang]?.toLowerCase() || '';
            return text.includes(term);
          });
        })
        .slice(0, limit); // Cắt lấy đúng số lượng limit (VD: 5 kết quả)
    };

    // Áp dụng lọc cho từng mảng
    const news = filterData(allNews, ['title_i18n', 'content_i18n']);
    const services = filterData(allServices, ['title_i18n', 'content_i18n']);
    const jobs = filterData(allJobs, ['title_i18n', 'description_i18n']);

    // 3. Chuẩn hóa dữ liệu trả về cho Frontend
    const mapData = (item: any, type: string) => ({
      id: item.id,
      title: item.title_i18n?.[lang] || item.title_i18n?.['vi'] || '',
      slug: item.slug_i18n?.[lang] || item.slug_i18n?.['vi'] || '',
      type,
      featured_image: item.featured_image || null,
    });

    const results = {
      news: news.map((item) => mapData(item, 'NEWS')),
      services: services.map((item) => mapData(item, 'SERVICE')),
      jobs: jobs.map((item) => mapData(item, 'JOB')),
    };

    // 4. Lưu lại lịch sử tìm kiếm (Chạy ngầm)
    const totalResults =
      results.news.length + results.services.length + results.jobs.length;
    this.prisma.searchLog
      .create({
        data: {
          keyword: keyword.trim(),
          lang: lang,
          results_count: totalResults,
        },
      })
      .catch((err) => console.error('Lỗi lưu Search Log:', err));

    return results;
  }
}
