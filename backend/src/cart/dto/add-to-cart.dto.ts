import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class addToCartDto {
  @ApiProperty({ example: 'productId: 1' })
  @IsInt()
  productId: number;

  @ApiProperty({ example: 'quantity: 2' })
  @IsInt()
  @Min(1)
  quantity: number;
}
