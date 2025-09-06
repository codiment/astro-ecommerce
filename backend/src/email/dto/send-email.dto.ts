import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsOptional } from 'class-validator';

export class SendTestEmailDto {
  @ApiProperty({
    example: 'usuario@ejemplo.com',
    description: 'Email del destinatario',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Juan Pérez',
    description: 'Nombre del destinatario',
  })
  @IsString()
  name: string;
}

export class SendCustomEmailDto {
  @ApiProperty({
    example: 'usuario@ejemplo.com',
    description: 'Email del destinatario',
  })
  @IsEmail()
  to: string;

  @ApiProperty({
    example: 'Asunto del email',
    description: 'Asunto del email',
  })
  @IsString()
  subject: string;

  @ApiProperty({
    example: 'Contenido del mensaje en texto plano',
    description: 'Contenido del email en texto plano',
  })
  @IsString()
  text: string;

  @ApiProperty({
    example: 'noreply@midominio.com',
    description: 'Email del remitente (opcional)',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  from?: string;
}
