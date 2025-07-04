// src/order/dto/update-order-status.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

// Redefinimos manualmente el enum para que Swagger lo interprete bien
export enum LocalOrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
}

export class UpdateOrderStatusDto {
  @ApiProperty({
    example: 'PAID',
    description: 'New status of the order',
    enum: LocalOrderStatus,
  })
  @IsEnum(LocalOrderStatus)
  status: LocalOrderStatus;
}
