import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { addToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getCart(userId: number) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }
    return cart;
  }

  async addToCart(userId: number, dto: addToCartDto) {
    const { productId, quantity } = dto;

    //1- Nos aseguramos que el producto existe
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    //2- Ver si el usuario tiene carrito
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
    });
    if (!cart) {
      cart = await this.prisma.cart.create({
        data: {
          userId,
        },
      });
    }

    //3- Ver si el producto ya esta en el carrito
    const existingItem = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
      },
    });
    if (existingItem) {
      //Si ya esta, actualizar cantidad
      return this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + quantity,
        },
      });
    }

    //4- Si no esta, agregar nuevo item
    return this.prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity,
      },
    });
  }

  async updateItemQuantity(userId: number, dto: UpdateCartItemDto) {
    const { cartItemId, quantity } = dto;

    //1- Buscar el item del carrito por su ID, incluyendo la info del carrito
    const item = await this.prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: {
        cart: true,
      },
    });

    //2- Verificar que el item exista y que pertenezca al usuario actual
    if (!item || item.cart.userId !== userId) {
      throw new NotFoundException('Cart item not found or not owned by user');
    }

    //3- Actualizar la cantidad del producto en el carrito
    return this.prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
    });
  }

  async removeItem(userId: number, cartItemId: number) {
    //1- Buscar el item por ID y traer el carrito al que pertenece
    const item = await this.prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: {
        cart: true,
      },
    });

    //2- Verificar que el item exista y que el carrito le pertenezca al usuario
    if (!item || item.cart.userId !== userId) {
      throw new NotFoundException('Cart item not found or not owned by user');
    }

    //3- Eliminar el item del carrito
    return this.prisma.cartItem.delete({
      where: { id: cartItemId },
    });
  }
}
