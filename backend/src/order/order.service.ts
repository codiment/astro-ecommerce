import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { EmailService, OrderEmailData } from 'src/email/email.service';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async createOrder(userId: number) {
    return this.prisma.$transaction(async (tx) => {
      // 1- Obtener el carrito del usuario con items y productos
      const cart = await tx.cart.findUnique({
        where: { userId },
        include: {
          items: {
            include: { product: true },
          },
        },
      });
      if (!cart || cart.items.length === 0) {
        throw new NotFoundException('Cart is empty or not found');
      }

      // 2- Validar stock y descontar en un solo paso atómico
      for (const item of cart.items) {
        const update = await tx.product.updateMany({
          where: {
            id: item.productId,
            stock: { gte: item.quantity },
          },
          data: {
            stock: { decrement: item.quantity },
          },
        });
        if (update.count === 0) {
          throw new BadRequestException(
            `Stock insuficiente para "${item.product.title}".`
          );
        }
      }

      // 3- Calcular el total
      const total = cart.items.reduce((sum, item) => {
        return sum + item.product.price * item.quantity;
      }, 0);

      // 4- Crear la orden y los items asociados
      const order = await tx.order.create({
        data: {
          userId,
          total,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          user: true,
        },
      });

      // 5- Vaciar el carrito
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      // 6- Enviar email de confirmación (fuera de la transacción)
      this.sendOrderConfirmationEmail(order);

      return order;
    });
  }

  private async sendOrderConfirmationEmail(order) {
    try {
      // Preparar los datos para el email
      const emailData: OrderEmailData = {
        customerName: order.user.name,
        orderId: order.id,
        orderTotal: order.total,
        items: order.items.map(item => ({
          title: item.product.title,
          quantity: item.quantity,
          price: item.price,
        })),
      };

      // Enviar email de forma no bloqueante
      this.emailService.sendOrderConfirmationEmail(order.user.email, emailData)
        .then(success => {
          if (success) {
            this.logger.log(`Order confirmation email sent for order #${order.id}`);
          } else {
            this.logger.warn(`Failed to send order confirmation email for order #${order.id}`);
          }
        })
        .catch(error => {
          this.logger.error(`Error sending order confirmation email: ${error.message}`);
        });
    } catch (error) {
      this.logger.error(`Error preparing order confirmation email: ${error.message}`);
    }
  }

  async getUserOrders(userId: number) {
    return this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  // 7- Estado de la orden de compra
  async payOrder(userid: number, orderId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.userId !== userid) {
      throw new ForbiddenException(
        'You do not have permission to pay this order',
      );
    }

    if (order.status === 'PAID') {
      throw new BadRequestException('Order is already paid');
    }

    if (order.status === 'CANCELLED') {
      throw new BadRequestException('Cannot pay a cancelled order');
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'PAID' },
    });
  }

  async updateOrderStatus(
    userId: number,
    orderId: number,
    newStatus: 'PENDING' | 'PAID' | 'CANCELLED',
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to update this order',
      );
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus },
    });

    // Enviar email de actualización de estado (no bloqueante)
    this.emailService.sendOrderStatusUpdateEmail(
      order.user.email,
      order.user.name ?? 'Cliente',
      orderId,
      newStatus
    )
      .then(success => {
        if (success) {
          this.logger.log(`Order status update email sent for order #${orderId}`);
        } else {
          this.logger.warn(`Failed to send order status update email for order #${orderId}`);
        }
      })
      .catch(error => {
        this.logger.error(`Error sending order status update email: ${error.message}`);
      });

    return updatedOrder;
  }
}
