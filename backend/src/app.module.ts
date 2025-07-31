import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductModule } from './product/product.module';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { CartModule } from './cart/cart.module';
import { OrderModule } from './order/order.module';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-ioredis';
import { ThrottlerModule, ThrottlerGuard, seconds } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

// Importar tu CacheModule propio (asegurate la ruta sea correcta)
import { CacheModule } from './cache/cache.module';
import { LoggerModule } from './logger/logger.module';
import { BullModule } from '@nestjs/bullmq';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    LoggerModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
    NestCacheModule.registerAsync({
      isGlobal: true,
      useFactory: () => ({
        store: redisStore,
        host: 'localhost',
        port: 6379,
        ttl: 0,
      }),
    }),

    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: seconds(60),
          limit: 1000,
        },
      ],
    }),

    BullModule.forRoot({
      connection: { host: 'localhost', port: 6379 },
    }),

    PrismaModule,
    ProductModule,
    UserModule,
    AuthModule,
    CartModule,
    OrderModule,
    CacheModule,
    EmailModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
