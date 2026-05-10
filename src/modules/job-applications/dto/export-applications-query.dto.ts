// File: src/modules/job-applications/dto/export-applications-query.dto.ts
import { IsOptional, IsString, IsDateString, IsIn } from 'class-validator';

// 🎯 Định nghĩa danh sách trạng thái hợp lệ để validate (Khớp với comment trong Schema)
const VALID_STATUSES = ['NEW', 'REVIEWING', 'INTERVIEW', 'REJECTED', 'HIRED'];

export class ExportApplicationsQueryDto {
  @IsOptional()
  @IsString()
  job_id?: string;

  @IsOptional()
  @IsString()
  @IsIn(VALID_STATUSES, {
    message: `Trạng thái không hợp lệ. Phải thuộc: ${VALID_STATUSES.join(', ')}`,
  })
  status?: string; // 🎯 SỬA: Dùng kiểu string thay vì Enum

  @IsOptional()
  @IsDateString(
    {},
    { message: 'Ngày bắt đầu không đúng định dạng ISO (YYYY-MM-DD)' },
  )
  startDate?: string;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'Ngày kết thúc không đúng định dạng ISO (YYYY-MM-DD)' },
  )
  endDate?: string;

  @IsOptional()
  @IsString()
  lang?: string = 'vi';
}
