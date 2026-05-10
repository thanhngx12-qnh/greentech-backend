// File: src/modules/search/dto/global-search-query.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GlobalSearchQueryDto {
  @IsString()
  @IsNotEmpty({ message: 'Vui lòng nhập từ khóa tìm kiếm' })
  keyword: string;

  @IsOptional()
  @IsString()
  lang?: string = 'vi';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 5; // Giới hạn số lượng kết quả cho *mỗi danh mục* (VD: 5 News, 5 Services)
}
