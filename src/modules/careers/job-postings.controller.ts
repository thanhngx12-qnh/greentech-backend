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
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Admin - Quản lý Tuyển dụng (Careers)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/job-postings')
export class JobPostingsController {
  constructor(private readonly jobPostingsService: JobPostingsService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Đăng tin tuyển dụng mới' })
  create(@Body() dto: CreateJobPostingDto, @Request() req: any) {
    return this.jobPostingsService.create(dto, req.user.userId);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Lấy danh sách tin tuyển dụng (Admin - Full JSON)' })
  findAll(@Query() query: GetJobPostingsQueryDto) {
    return this.jobPostingsService.findAll(query);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Xem chi tiết tin tuyển dụng theo ID' })
  @ApiParam({ name: 'id', description: 'ID bài đăng (UUID)' })
  findOne(@Param('id') id: string) {
    return this.jobPostingsService.findOne(id);
  }

  @Put(':id')
  @Roles(Role.SUPER_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Cập nhật tin tuyển dụng' })
  @ApiParam({ name: 'id', description: 'ID bài đăng cần sửa' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateJobPostingDto,
    @Request() req: any,
  ) {
    return this.jobPostingsService.update(id, dto, req.user.userId);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Xóa tin tuyển dụng (Soft Delete)' })
  @ApiParam({ name: 'id', description: 'ID bài đăng cần xóa' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.jobPostingsService.remove(id, req.user.userId);
  }
}
