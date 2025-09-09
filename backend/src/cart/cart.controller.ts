import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from 'src/auth/jwt.auth.guard';
import { addToCartDto } from './dto/add-to-cart.dto';
import { ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@ApiBearerAuth()
@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@CurrentUser() user: { id: number }) {
    return this.cartService.getCart(user.id);
  }

  @Post('add')
  @ApiOperation({
    summary: 'Add item to cart',
    description: 'Add item to cart. Use replace=true for idempotent behavior.',
  })
  @ApiQuery({
    name: 'replace',
    description: 'If true, replaces quantity instead of adding (idempotent)',
    required: false,
    type: Boolean,
  })
  addToCart(
    @CurrentUser() user: { id: number },
    @Body() dto: addToCartDto,
    @Query('replace') replace?: string,
  ) {
    const replaceMode = replace === 'true';
    return this.cartService.addToCart(user.id, dto, replaceMode);
  }

  @Patch('update')
  updateItem(
    @CurrentUser() user: { id: number },
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItemQuantity(user.id, dto);
  }

  @Delete('remove/:id')
  removeItem(@CurrentUser() user: { id: number }, @Param('id') id: string) {
    return this.cartService.removeItem(user.id, parseInt(id));
  }
}
