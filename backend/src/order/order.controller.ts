import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { JwtAuthGuard } from 'src/auth/jwt.auth.guard';
import { ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

// Definir interfaz para que req.user
interface AuthenticatedRequest extends Request {
  user: {
    id: number;
  };
}

@Controller('order')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  getUserOrders(@Req() req: AuthenticatedRequest) {
    return this.orderService.getUserOrders(req.user.id);
  }

  @Post()
  createOrder(@Req() req: AuthenticatedRequest) {
    return this.orderService.createOrder(req.user.id);
  }

  @Patch('pay/:id')
  @ApiOperation({ summary: 'Mark an order as paid' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  async payOrder(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const orderId = parseInt(id);
    if (isNaN(orderId)) {
      throw new NotFoundException('Invalid order ID');
    }
    return this.orderService.payOrder(req.user.id, orderId);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update order status manually' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderStatusDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.orderService.updateOrderStatus(req.user.id, id, dto.status);
  }
}
