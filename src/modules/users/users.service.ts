// File: src/modules/users/users.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetUsersQueryDto } from './dto/get-users-query.dto';
import * as bcrypt from 'bcrypt';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private auditLogsService: AuditLogsService,
  ) {}

  // 1. Tạo mới tài khoản nhân viên (Dành cho Super Admin)
  async create(dto: CreateUserDto, currentUserId?: string) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new BadRequestException({
        errorCode: 'EMAIL_EXISTS',
        message: 'Email này đã được sử dụng',
      });
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    try {
      const newUser = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
          full_name: dto.full_name,
          role: dto.role,
        },
      });

      // 🎯 CHỈ GHI LOG KHI CÓ NGƯỜI TẠO (Nếu là Admin tạo hộ)
      if (currentUserId) {
        this.auditLogsService.logChange(
          currentUserId,
          'CREATE',
          'USERS',
          newUser.id,
          null,
          { email: dto.email, role: dto.role },
        );
      }

      return newUser;
    } catch (error) {
      throw new InternalServerErrorException('Không thể tạo tài khoản');
    }
  }

  // 2. Lấy danh sách nhân viên (Có phân trang, lọc, tìm kiếm)
  async findAll(query: GetUsersQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = { deleted_at: null };
    if (query.role) where.role = query.role;
    if (query.search) {
      where.OR = [
        { full_name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        select: {
          // 🎯 BẢO MẬT: Loại bỏ password khỏi kết quả trả về
          id: true,
          email: true,
          full_name: true,
          role: true,
          created_at: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // 3. Tìm chi tiết 1 nhân viên
  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id, deleted_at: null },
      select: {
        id: true,
        email: true,
        full_name: true,
        role: true,
        created_at: true,
      },
    });
    if (!user)
      throw new NotFoundException({
        errorCode: 'USER_NOT_FOUND',
        message: 'Nhân viên không tồn tại',
      });
    return user;
  }

  // 4. Cập nhật thông tin/quyền hạn
  async update(id: string, dto: UpdateUserDto, currentUserId: string) {
    const existing = await this.findOne(id);
    const updateData: Prisma.UserUpdateInput = { ...dto };

    // Nếu có đổi mật khẩu thì phải hash lại
    if (dto.password) {
      updateData.password = await bcrypt.hash(dto.password, 10);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });

    // 🎯 BẮN LOG
    this.auditLogsService.logChange(
      currentUserId,
      'UPDATE',
      'USERS',
      id,
      existing,
      dto,
    );

    return updatedUser;
  }

  // 5. Vô hiệu hóa tài khoản (Soft Delete)
  async remove(id: string, currentUserId: string) {
    const existing = await this.findOne(id);

    // 🎯 CHỐNG TỰ SÁT: Không cho Admin tự xóa chính mình
    if (id === currentUserId) {
      throw new BadRequestException(
        'Bạn không thể tự xóa tài khoản của chính mình',
      );
    }

    await this.prisma.user.update({
      where: { id },
      data: { deleted_at: new Date() },
    });

    // 🎯 BẮN LOG
    this.auditLogsService.logChange(
      currentUserId,
      'DELETE',
      'USERS',
      id,
      existing,
      null,
    );

    return { message: 'Đã xóa tài khoản nhân viên thành công' };
  }

  // Dùng cho module Auth đăng nhập (Cần lấy password để compare)
  async findByEmail(email: string) {
    return this.prisma.user.findFirst({ where: { email, deleted_at: null } });
  }
}
