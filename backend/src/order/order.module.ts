import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { BullModule } from '@nestjs/bullmq';
import { OrderProcessor } from './order.processor';
import { OrderCronService } from './order.cron.service';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({
      name: 'order-cleanup',
    }),
  ],
  controllers: [OrderController],
  providers: [OrderProcessor, OrderCronService, OrderService],
})
export class OrderModule {}
