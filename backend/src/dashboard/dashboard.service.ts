import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const [totalSales, totalUsers, totalProducts, orders] = await Promise.all([
      this.getTotalSales(),
      this.getTotalUsers(),
      this.getTotalProducts(),
      this.getOrderStats(),
    ]);

    return {
      totalSales,
      totalUsers,
      totalProducts,
      conversionRate: 3.2,
      salesGrowth: 12.5,
      userGrowth: 15.7,
      productGrowth: 8.3,
      conversionGrowth: 2.1,
    };
  }

  private async getTotalSales(): Promise<number> {
    const result = await this.prisma.order.aggregate({
      where: { status: 'PAID' },
      _sum: { total: true },
    });
    return result._sum.total || 0;
  }

  private async getTotalUsers(): Promise<number> {
    return this.prisma.user.count();
  }

  private async getTotalProducts(): Promise<number> {
    return this.prisma.product.count();
  }

  private async getOrderStats() {
    return this.prisma.order.groupBy({
      by: ['status'],
      _count: { status: true },
    });
  }
}
