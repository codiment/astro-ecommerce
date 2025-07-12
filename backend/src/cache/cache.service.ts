// src/cache/cache.service.ts
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class TestCacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async setCacheExample(key: string, value: string, ttl?: number) {
    try {
      await this.cacheManager.set(key, value, ttl);
      console.log(`Guardado en cache: ${key} = ${value}, TTL: ${ttl}`);
      return { message: `Valor guardado en cache con key: ${key}` };
    } catch (err) {
      console.error('Error guardando en cache:', err);
      throw err;
    }
  }

  async getCacheExample(key: string) {
    const value = await this.cacheManager.get(key);
    return { value: value ?? 'No hay valor en cache' };
  }
}
