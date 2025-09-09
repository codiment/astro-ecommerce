import {
  Body,
  Controller,
  Get,
  Headers,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { JwtAuthGuard } from 'src/auth/jwt.auth.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiHeader,
} from '@nestjs/swagger';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@Controller('order')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  getUserOrders(@CurrentUser() user: { id: number }) {
    return this.orderService.getUserOrders(user.id);
  }

  @Post()
  @ApiOperation({
    summary: 'Create a new order',
    description:
      "Creates a new order from the user's cart. Supports idempotency via header.",
  })
  @ApiHeader({
    name: 'Idempotency-Key',
    description: 'Optional idempotency key to prevent duplicate orders',
    required: false,
  })
  createOrder(
    @CurrentUser() user: { id: number },
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    return this.orderService.createOrder(user.id, idempotencyKey);
  }

  @Patch('pay/:id')
  @ApiOperation({ summary: 'Mark an order as paid' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  async payOrder(@Param('id') id: string, @CurrentUser() user: { id: number }) {
    const orderId = parseInt(id);
    if (isNaN(orderId)) {
      throw new NotFoundException('Invalid order ID');
    }
    return this.orderService.payOrder(user.id, orderId);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update order status manually' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderStatusDto,
    @CurrentUser() user: { id: number },
  ) {
    return this.orderService.updateOrderStatus(user.id, id, dto.status);
  }
}
