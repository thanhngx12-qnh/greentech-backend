// File: src/modules/search/search.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GlobalSearchQueryDto } from './dto/global-search-query.dto';
import { GetSearchLogsQueryDto } from './dto/get-search-logs-query.dto'; // <-- IMPORT MỚI
import { ExportSearchLogsQueryDto } from './dto/export-search-logs-query.dto'; // <-- IMPORT MỚI
import { NewsStatus, ServiceStatus, JobStatus, Prisma } from '@prisma/client';
import { Parser } from 'json2csv'; // <-- DÙNG JSON2CSV ĐỂ XUẤT FILE
import { AuditLogsService } from '../audit-logs/audit-logs.service'; // <-- IMPORT AUDIT LOG

@Injectable()
export class SearchService {
  constructor(
    private prisma: PrismaService,
    private auditLogsService: AuditLogsService, // <-- INJECT AUDIT LOG
  ) {}

  // ========================================================
  // --- PUBLIC: TÌM KIẾM TOÀN CẦU (Hybrid Search) ---
  // ========================================================

  async globalSearch(query: GlobalSearchQueryDto) {
    const { keyword, lang = 'vi', limit = 5 } = query;
    const term = keyword.toLowerCase().trim();

    // 1. Lấy tất cả dữ liệu đang PUBLISHED từ DB
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

    // 2. Lọc bằng JavaScript để hỗ trợ tiếng Việt chuẩn 100%
    const filterData = (items: any[], fields: string[]) => {
      return items
        .filter((item) => {
          return fields.some((field) => {
            const text = (item[field] as any)?.[lang]?.toLowerCase() || '';
            return text.includes(term);
          });
        })
        .slice(0, limit);
    };

    const news = filterData(allNews, ['title_i18n', 'content_i18n']);
    const services = filterData(allServices, ['title_i18n', 'content_i18n']);
    const jobs = filterData(allJobs, ['title_i18n', 'description_i18n']);

    // 3. Chuẩn hóa format trả về
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

  // ========================================================
  // --- ADMIN METHODS: PHÂN TÍCH SEARCH LOGS ---
  // ========================================================

  /**
   * Lấy danh sách lịch sử tìm kiếm để hiển thị lên bảng Dashboard
   */
  async findAllAdmin(query: GetSearchLogsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.SearchLogWhereInput = {};
    if (query.lang) where.lang = query.lang;
    if (query.search) {
      where.keyword = { contains: query.search, mode: 'insensitive' };
    }

    const [data, total] = await Promise.all([
      this.prisma.searchLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.searchLog.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Xuất báo cáo từ khóa khách hàng ra file CSV (Excel)
   */
  async exportToCsv(query: ExportSearchLogsQueryDto, currentUserId: string) {
    const { startDate, endDate, lang = 'vi' } = query;

    const where: Prisma.SearchLogWhereInput = {};
    if (startDate || endDate) {
      where.created_at = {
        gte: startDate ? new Date(startDate) : undefined,
        lte: endDate ? new Date(endDate) : undefined,
      };
    }

    const logs = await this.prisma.searchLog.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });

    // Định nghĩa tiêu đề file CSV
    const fields = [
      {
        label: lang === 'vi' ? 'Thời gian' : 'Time',
        value: (row: any) => row.created_at.toLocaleString('vi-VN'),
      },
      { label: lang === 'vi' ? 'Từ khóa' : 'Keyword', value: 'keyword' },
      { label: lang === 'vi' ? 'Ngôn ngữ' : 'Language', value: 'lang' },
      {
        label: lang === 'vi' ? 'Số kết quả tìm thấy' : 'Results Found',
        value: 'results_count',
      },
    ];

    try {
      // Dùng UTF-8 BOM để Excel mở lên không bị lỗi font Tiếng Việt
      const json2csvParser = new Parser({ fields, withBOM: true });
      const csv = json2csvParser.parse(logs);

      // 🎯 GHI LOG: Truy vết ai là người đã trích xuất dữ liệu Marketing
      this.auditLogsService.logChange(
        currentUserId,
        'UPDATE',
        'SEARCH_LOGS',
        'ALL',
        null,
        { action: 'EXPORT_CSV', filters: query },
      );

      return csv;
    } catch (error) {
      console.error('Export Search Logs Error:', error);
      throw new InternalServerErrorException(
        'Lỗi khi xuất file báo cáo tìm kiếm',
      );
    }
  }
}
