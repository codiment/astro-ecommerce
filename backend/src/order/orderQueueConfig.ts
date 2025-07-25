// src/order/orderQueueConfig.ts
import { QueueOptions } from 'bullmq';

export const orderQueueConfig: QueueOptions = {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
  },
};
