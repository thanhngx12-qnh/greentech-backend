// File: src/modules/news/news.controller.ts
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
import { NewsService } from './news.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Role } from '@prisma/client';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Admin - Quản lý Tin tức (CMS)') // 🎯 Gom nhóm
@ApiBearerAuth() // 🎯 Hiện nút điền Token
@Controller('admin/news')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Tạo bài viết tin tức mới' })
  create(@Body() dto: CreateNewsDto, @Request() req: any) {
    return this.newsService.create(dto, req.user.userId);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Lấy danh sách bài viết tin tức (Full thông tin)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'DRAFT, PUBLISHED, etc.',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Tìm theo tiêu đề',
  })
  findAll(@Query() query: any) {
    return this.newsService.findAll(query);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Xem chi tiết bài viết (Cho màn hình sửa)' })
  @ApiParam({ name: 'id', description: 'ID của bài viết' })
  findOne(@Param('id') id: string) {
    return this.newsService.findOne(id);
  }

  @Put(':id')
  @Roles(Role.SUPER_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Cập nhật nội dung bài viết' })
  @ApiParam({ name: 'id', description: 'ID của bài viết cần sửa' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateNewsDto,
    @Request() req: any,
  ) {
    return this.newsService.update(id, dto, req.user.userId);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Xóa bài viết (Lưu log người xóa)' })
  @ApiParam({ name: 'id', description: 'ID của bài viết cần xóa' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.newsService.remove(id, req.user.userId);
  }
}
