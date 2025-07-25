import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    example: 'usuario@ejemplo.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'password123',
  })
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: 'lol doe',
  })
  @IsString()
  name: string;
}
