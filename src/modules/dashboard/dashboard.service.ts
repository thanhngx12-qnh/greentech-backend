// File: src/modules/dashboard/dashboard.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GetStatsQueryDto } from './dto/get-stats-query.dto';
import { Prisma, NewsStatus, ServiceStatus, JobStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  /**
   * API 1: Lấy các con số thống kê nhanh (Widget) - PHIÊN BẢN ĐẦY ĐỦ
   */
  async getStats(query: GetStatsQueryDto) {
    const { startDate, endDate } = query;

    const dateFilter: Prisma.DateTimeFilter = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    // Sử dụng Promise.all để "bắn" song song tất cả các câu query
    const [
      // 1. Nhóm Kinh doanh & Marketing (Leads)
      totalLeads,
      newLeadsInRange,

      // 2. Nhóm Nhân sự (Careers)
      totalApplications,
      totalOpenJobs,

      // 3. Nhóm Nội dung (Content)
      totalPublishedNews,
      totalPublishedServices,
      totalStandards,

      // 4. Nhóm Hệ thống (System)
      totalUsers,
      totalSliders,
    ] = await this.prisma.$transaction([
      // Dùng $transaction để đảm bảo các câu query chạy trên cùng 1 phiên DB
      this.prisma.lead.count(),
      this.prisma.lead.count({ where: { created_at: dateFilter } }),

      this.prisma.jobApplication.count(),
      this.prisma.job.count({ where: { status: 'OPEN', deleted_at: null } }),

      this.prisma.news.count({
        where: { status: 'PUBLISHED', deleted_at: null },
      }),
      this.prisma.service.count({
        where: { status: 'PUBLISHED', deleted_at: null },
      }),
      this.prisma.standard.count({ where: { deleted_at: null } }),

      this.prisma.user.count({ where: { deleted_at: null } }),
      this.prisma.slider.count({ where: { deleted_at: null } }),
    ]);

    return {
      // Dữ liệu kinh doanh
      leads: {
        total: totalLeads,
        inRange: newLeadsInRange,
      },
      // Dữ liệu nhân sự
      careers: {
        applications: totalApplications,
        openJobs: totalOpenJobs,
      },
      // Dữ liệu nội dung
      content: {
        news: totalPublishedNews,
        services: totalPublishedServices,
        standards: totalStandards,
      },
      // Dữ liệu hệ thống
      system: {
        users: totalUsers,
        sliders: totalSliders,
      },
    };
  }

  /**
   * API 2: Lấy dữ liệu tăng trưởng Leads để vẽ biểu đồ
   */
  async getLeadGrowth(query: GetStatsQueryDto) {
    const { startDate, endDate } = query;
    const start = startDate
      ? new Date(startDate)
      : new Date(new Date().setDate(new Date().getDate() - 30));
    const end = endDate ? new Date(endDate) : new Date();

    const results: { date: Date; count: BigInt }[] = await this.prisma
      .$queryRaw`
      SELECT DATE(created_at) as date, COUNT(id) as count
      FROM leads
      WHERE created_at >= ${start} AND created_at <= ${end}
      GROUP BY DATE(created_at)
      ORDER BY date ASC;
    `;

    return results.map((item) => ({
      date: item.date.toISOString().split('T')[0],
      count: Number(item.count),
    }));
  }

  /**
   * API 3: Lấy Top 10 từ khóa được tìm kiếm nhiều nhất
   */
  async getTopSearchKeywords() {
    const results = await this.prisma.searchLog.groupBy({
      by: ['keyword'],
      _count: { keyword: true },
      orderBy: { _count: { keyword: 'desc' } },
      take: 10,
    });

    return results.map((item) => ({
      keyword: item.keyword,
      count: item._count.keyword,
    }));
  }

  /**
   * API 4: Lấy danh sách các hoạt động nội dung gần đây
   */
  async getRecentActivities() {
    // 🎯 FIX: Thêm `::text` để ép kiểu các cột Enum khác nhau về cùng kiểu TEXT trong SQL
    const results: any[] = await this.prisma.$queryRaw`
      (
        SELECT id, title_i18n, updated_at, 'NEWS' as type, status::text
        FROM news WHERE deleted_at IS NULL ORDER BY updated_at DESC LIMIT 5
      )
      UNION ALL
      (
        SELECT id, title_i18n, updated_at, 'SERVICES' as type, status::text
        FROM services WHERE deleted_at IS NULL ORDER BY updated_at DESC LIMIT 5
      )
      UNION ALL
      (
        SELECT id, title_i18n, updated_at, 'JOBS' as type, status::text
        FROM jobs WHERE deleted_at IS NULL ORDER BY updated_at DESC LIMIT 5
      )
      ORDER BY updated_at DESC
      LIMIT 10;
    `;

    // Logic mapping phía dưới không cần thay đổi
    const activities = results.map((item) => ({
      id: item.id,
      title: item.title_i18n?.vi || 'N/A',
      type: item.type,
      status: item.status,
      updated_at: item.updated_at,
    }));

    return activities;
  }

  /**
   * API 5: Thống kê phễu chuyển đổi Leads
   */
  async getLeadConversionFunnel() {
    const funnel = await this.prisma.lead.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    return funnel.reduce(
      (acc, item) => {
        acc[item.status] = item._count.id;
        return acc;
      },
      {} as Record<string, number>,
    );
  }
}
