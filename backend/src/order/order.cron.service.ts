// src/orders/order.cron.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';

@Injectable()
export class OrderCronService implements OnModuleInit {
  constructor(
    @InjectQueue('order-cleanup') private readonly orderQueue: Queue,
  ) {}

  async onModuleInit() {
    await this.orderQueue.add(
      'clean-orders',
      {},
      {
        repeat: {
          every: 1000 * 60 * 60 * 24,
        },
        jobId: 'clean-orders-cron-v3',
        removeOnComplete: true,
        removeOnFail: true,
      },
    );

    console.log('[INIT] Cron job scheduled for cleaning orders.');
  }
}
