// src/order/order.processor.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Worker } from 'bullmq';
import { PrismaService } from 'src/prisma/prisma.service';
import { orderQueueConfig } from './orderQueueConfig';

@Injectable()
export class OrderProcessor implements OnModuleInit, OnModuleDestroy {
  private worker: Worker;

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    this.worker = new Worker(
      'order-cleanup',
      async (job) => {
        console.log('🔥 Procesando orden:', job.name);

        const now = new Date();
        const result = await this.prisma.order.deleteMany({
          where: {
            status: { in: ['PENDING', 'CANCELLED'] },
            createdAt: { lte: new Date(now.getTime() - 24 * 60 * 60 * 1000) }, // 24 hs
          },
        });

        console.log(`[CLEANUP JOB] Deleted ${result.count} old orders.`);
      },
      orderQueueConfig,
    );
  }

  async onModuleDestroy() {
    await this.worker?.close();
  }
}
