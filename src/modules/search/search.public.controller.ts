// File: src/modules/search/search.public.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { GlobalSearchQueryDto } from './dto/global-search-query.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Website - Tìm kiếm toàn cầu')
@Controller('api/public/search')
export class SearchPublicController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Tìm kiếm đa luồng (News, Services, Jobs)' })
  async globalSearch(@Query() query: GlobalSearchQueryDto) {
    return this.searchService.globalSearch(query);
  }
}
