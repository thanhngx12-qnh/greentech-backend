// File: src/modules/categories/categories.controller.ts
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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { GetCategoriesQueryDto } from './dto/get-categories-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Admin - Quản lý Danh mục (Categories)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Tạo danh mục mới (Cho News, Services, Jobs...)' })
  create(@Body() dto: CreateCategoryDto, @Request() req: any) {
    // 🎯 Truyền userId để ghi Log
    return this.categoriesService.create(dto, req.user.userId);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Lấy danh sách tất cả danh mục (Admin view)' })
  findAll(@Query() query: GetCategoriesQueryDto) {
    return this.categoriesService.findAll(query);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Xem chi tiết một danh mục' })
  @ApiParam({ name: 'id', type: 'number' })
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(+id);
  }

  @Put(':id')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Cập nhật danh mục' })
  @ApiParam({ name: 'id', type: 'number' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
    @Request() req: any,
  ) {
    // 🎯 Truyền userId để ghi Log
    return this.categoriesService.update(+id, dto, req.user.userId);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Xóa danh mục (Soft Delete)' })
  @ApiParam({ name: 'id', type: 'number' })
  remove(@Param('id') id: string, @Request() req: any) {
    // 🎯 Truyền userId để ghi Log
    return this.categoriesService.remove(+id, req.user.userId);
  }
}
