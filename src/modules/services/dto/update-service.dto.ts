// File: src/modules/services/dto/update-service.dto.ts
import { PartialType } from '@nestjs/swagger'; // 🎯 Đổi sang swagger partial để hiện field
import { CreateServiceDto } from './create-service.dto';

export class UpdateServiceDto extends PartialType(CreateServiceDto) {}
