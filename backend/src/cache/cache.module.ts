import { Module } from '@nestjs/common';
import { TestCacheService } from './cache.service';
import { TestCacheController } from './cache.controller';

@Module({
  providers: [TestCacheService],
  controllers: [TestCacheController],
})
export class CacheModule {}
