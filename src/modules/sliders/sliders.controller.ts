// File: src/modules/sliders/sliders.controller.ts
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
import { SlidersService } from './sliders.service';
import { CreateSliderDto } from './dto/create-slider.dto';
import { UpdateSliderDto } from './dto/update-slider.dto';
import { GetSlidersQueryDto } from './dto/get-sliders-query.dto';
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

@ApiTags('Admin - Quản lý Banner (Sliders)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/sliders')
export class SlidersController {
  constructor(private readonly slidersService: SlidersService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Tạo banner mới' })
  create(@Body() dto: CreateSliderDto, @Request() req: any) {
    return this.slidersService.create(dto, req.user.userId);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Lấy danh sách banner (Admin View)' })
  findAll(@Query() query: GetSlidersQueryDto) {
    return this.slidersService.findAll(query);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Xem chi tiết một banner' })
  @ApiParam({ name: 'id', type: 'number' })
  findOne(@Param('id') id: string) {
    return this.slidersService.findOne(+id);
  }

  @Put(':id')
  @Roles(Role.SUPER_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Cập nhật banner' })
  @ApiParam({ name: 'id', type: 'number' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateSliderDto,
    @Request() req: any,
  ) {
    return this.slidersService.update(+id, dto, req.user.userId);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Xóa banner (Soft Delete)' })
  @ApiParam({ name: 'id', type: 'number' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.slidersService.remove(+id, req.user.userId);
  }
}
