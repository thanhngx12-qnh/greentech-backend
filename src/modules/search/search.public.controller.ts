// File: src/modules/search/search.public.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { GlobalSearchQueryDto } from './dto/global-search-query.dto';

@Controller('api/public/search')
export class SearchPublicController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  async globalSearch(@Query() query: GlobalSearchQueryDto) {
    // Controller nhận query từ DTO đã được validate (chắc chắn có keyword)
    // và đẩy xuống Service xử lý
    return this.searchService.globalSearch(query);
  }
}
