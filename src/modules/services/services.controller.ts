// File: src/modules/services/services.controller.ts
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
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Role } from '@prisma/client';

@Controller('admin/services')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.EDITOR, Role.SALES)
  create(@Body() dto: CreateServiceDto, @Request() req: any) {
    return this.servicesService.create(dto, req.user.userId);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.EDITOR, Role.SALES)
  findAll(@Query() query: any) {
    return this.servicesService.findAll(query);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.EDITOR, Role.SALES)
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(id);
  }

  @Put(':id')
  @Roles(Role.SUPER_ADMIN, Role.EDITOR)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateServiceDto,
    @Request() req: any,
  ) {
    // 🎯 Truyền userId từ Token xuống Service để Audit Log biết AI đang sửa
    return this.servicesService.update(id, dto, req.user.userId);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN)
  remove(@Param('id') id: string, @Request() req: any) {
    // 🎯 Truyền userId từ Token xuống Service để Audit Log biết AI đang xóa
    return this.servicesService.remove(id, req.user.userId);
  }
}
