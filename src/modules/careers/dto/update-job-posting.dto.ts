// File: src/modules/careers/dto/update-job-posting.dto.ts
import { PartialType } from '@nestjs/swagger'; // 🎯 Chuyển sang import từ swagger để giữ Decorator
import { CreateJobPostingDto } from './create-job-posting.dto';

export class UpdateJobPostingDto extends PartialType(CreateJobPostingDto) {
  // Toàn bộ các trường từ CreateJobPostingDto sẽ tự động trở thành Optional và giữ nguyên mô tả trên Swagger
}
