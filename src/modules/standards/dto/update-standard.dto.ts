// File: src/modules/standards/dto/update-standard.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateStandardDto } from './create-standard.dto';

export class UpdateStandardDto extends PartialType(CreateStandardDto) {}
