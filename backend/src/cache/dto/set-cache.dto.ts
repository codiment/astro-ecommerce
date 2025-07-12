import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber } from 'class-validator';

export class SetCacheDto {
  @ApiProperty({ example: 'mykey' })
  @IsString()
  key: string;

  @ApiProperty({ example: 'Hello Redis!' })
  @IsString()
  value: string;

  @ApiProperty({ example: 10, description: 'TTL en segundos', required: false })
  @IsOptional()
  @IsNumber()
  ttl?: number;
}
