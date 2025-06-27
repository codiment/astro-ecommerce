import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from 'src/auth/jwt.auth.guard';
import { addToCartDto } from './dto/add-to-cart.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@ApiBearerAuth()
@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@Req() req) {
    return this.cartService.getCart(req.user.id);
  }

  @Post('add')
  addToCart(@Req() req, @Body() dto: addToCartDto) {
    return this.cartService.addToCart(req.user.id, dto);
  }

  @Patch('update')
  updateItem(@Req() req, @Body() dto: UpdateCartItemDto) {
    return this.cartService.updateItemQuantity(req.user.id, dto);
  }

  @Delete('remove/:id')
  removeItem(@Req() req, @Param('id') id: string) {
    return this.cartService.removeItem(req.user.id, parseInt(id));
  }
}
