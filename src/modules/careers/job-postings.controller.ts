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

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.EDITOR)
  create(@Body() dto: CreateJobPostingDto, @Request() req: any) {
    return this.jobPostingsService.create(dto, req.user.userId);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.EDITOR)
  findAll(@Query() query: GetJobPostingsQueryDto) {
    return this.jobPostingsService.findAll(query);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.EDITOR)
  findOne(@Param('id') id: string) {
    return this.jobPostingsService.findOne(id);
  }

  @Put(':id')
  @Roles(Role.SUPER_ADMIN, Role.EDITOR)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateJobPostingDto,
    @Request() req: any, // 🎯 Bắt request để lấy thông tin User
  ) {
    // 🎯 Truyền userId xuống Service để ghi Audit Log
    return this.jobPostingsService.update(id, dto, req.user.userId);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN)
  remove(@Param('id') id: string, @Request() req: any) {
    // 🎯 Truyền userId xuống Service để ghi Audit Log
    return this.jobPostingsService.remove(id, req.user.userId);
  }
}
