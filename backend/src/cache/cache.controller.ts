// src/cache/cache.controller.ts
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { TestCacheService } from './cache.service';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { SetCacheDto } from './dto/set-cache.dto';

@ApiTags('Cache Test')
@Controller('test-cache')
export class TestCacheController {
  constructor(private readonly testCacheService: TestCacheService) {}

  @Post('set')
  @ApiOperation({ summary: 'Set cache key with a value and optional TTL' })
  setValue(@Body() dto: SetCacheDto) {
    return this.testCacheService.setCacheExample(dto.key, dto.value, dto.ttl);
  }

  @Get('get/:key')
  @ApiOperation({ summary: 'Get cached value by key' })
  @ApiParam({
    name: 'key',
    example: 'mykey',
    description: 'Key to retrieve from cache',
  })
  getValue(@Param('key') key: string) {
    return this.testCacheService.getCacheExample(key);
  }
}
