// File: src/modules/services/dto/seo-detail.dto.ts
import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SeoDetailDto {
  @ApiPropertyOptional({
    example: 'Phòng thí nghiệm phân tích nước QCVN',
    description: 'Meta title SEO',
  })
  @IsOptional()
  @IsString()
  meta_title?: string;

  @ApiPropertyOptional({
    example: 'Dịch vụ phân tích chuyên nghiệp tại Greentech...',
    description: 'Meta description SEO',
  })
  @IsOptional()
  @IsString()
  meta_description?: string;

  @ApiPropertyOptional({
    example: 'phân tích nước, qcvn, hóa học',
    description: 'Meta keywords',
  })
  @IsOptional()
  @IsString()
  meta_keywords?: string;

  @ApiPropertyOptional({ description: 'URL ảnh khi chia sẻ link mạng xã hội' })
  @IsOptional()
  @IsString()
  og_image?: string;

  @ApiPropertyOptional({ description: 'Tiêu đề hiển thị trên Social Card' })
  @IsOptional()
  @IsString()
  og_title?: string;

  @ApiPropertyOptional({ description: 'Mô tả hiển thị trên Social Card' })
  @IsOptional()
  @IsString()
  og_description?: string;

  @ApiPropertyOptional({ example: 'summary_large_image' })
  @IsOptional()
  @IsString()
  twitter_card?: string;
}
