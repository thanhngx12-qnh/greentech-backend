// File: src/modules/sliders/dto/update-slider.dto.ts
import { PartialType } from '@nestjs/swagger'; // 🎯 Chuyển sang Swagger PartialType
import { CreateSliderDto } from './create-slider.dto';

export class UpdateSliderDto extends PartialType(CreateSliderDto) {}
