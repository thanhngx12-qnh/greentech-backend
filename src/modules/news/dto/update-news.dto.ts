// File: src/modules/news/dto/update-news.dto.ts
import { PartialType } from '@nestjs/swagger'; // 🎯 Quan trọng: Dùng từ swagger thay vì mapped-types
import { CreateNewsDto } from './create-news.dto';

export class UpdateNewsDto extends PartialType(CreateNewsDto) {}
