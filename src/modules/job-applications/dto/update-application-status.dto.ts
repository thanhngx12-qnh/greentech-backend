// File: src/modules/job-applications/dto/update-application-status.dto.ts
import { IsString, IsNotEmpty, IsIn } from 'class-validator';

// Theo Schema của bạn, status là String thay vì Enum, nên ta dùng IsIn để bảo vệ
const ALLOWED_STATUSES = ['NEW', 'REVIEWING', 'INTERVIEW', 'REJECTED', 'HIRED'];

export class UpdateApplicationStatusDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(ALLOWED_STATUSES, {
    message: `Status phải thuộc: ${ALLOWED_STATUSES.join(', ')}`,
  })
  status: string;
}
