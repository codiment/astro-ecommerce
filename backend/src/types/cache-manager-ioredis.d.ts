declare module 'cache-manager-ioredis' {
  import { CacheStore } from '@nestjs/cache-manager';

  interface RedisStoreOptions {
    host?: string;
    port?: number;
    username?: string;
    password?: string;
    ttl?: number;
  }

  function redisStore(options?: RedisStoreOptions): Promise<CacheStore>;

  export { redisStore };
}
