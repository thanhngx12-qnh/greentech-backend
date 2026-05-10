// File: src/modules/careers/job-postings.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JobPostingsService } from './job-postings.service';
import { CreateJobPostingDto } from './dto/create-job-posting.dto';
import { UpdateJobPostingDto } from './dto/update-job-posting.dto';
import { GetJobPostingsQueryDto } from './dto/get-job-postings-query.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Role } from '@prisma/client';

@Controller('admin/job-postings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class JobPostingsController {
  constructor(private readonly jobPostingsService: JobPostingsService) {}

  // Tạo tin tuyển dụng mới
  @Post()
  @Roles(Role.SUPER_ADMIN, Role.EDITOR) // Chỉ Admin và Editor mới được đăng tin
  create(@Body() dto: CreateJobPostingDto, @Request() req: any) {
    // Tự động lấy ID của người đang thao tác từ JWT Token
    const authorId = req.user.userId;
    return this.jobPostingsService.create(dto, authorId);
  }

  // Lấy danh sách tin tuyển dụng (có phân trang, tìm kiếm)
  @Get()
  @Roles(Role.SUPER_ADMIN, Role.EDITOR)
  findAll(@Query() query: GetJobPostingsQueryDto) {
    return this.jobPostingsService.findAll(query);
  }

  // Xem chi tiết một tin tuyển dụng
  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.EDITOR)
  findOne(@Param('id') id: string) {
    return this.jobPostingsService.findOne(id);
  }

  // Cập nhật tin tuyển dụng
  @Put(':id')
  @Roles(Role.SUPER_ADMIN, Role.EDITOR)
  update(@Param('id') id: string, @Body() dto: UpdateJobPostingDto) {
    return this.jobPostingsService.update(id, dto);
  }

  // Xóa tin tuyển dụng (Soft Delete)
  @Delete(':id')
  @Roles(Role.SUPER_ADMIN) // Chỉ SUPER_ADMIN mới có quyền xóa
  remove(@Param('id') id: string) {
    return this.jobPostingsService.remove(id);
  }
}
