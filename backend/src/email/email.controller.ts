import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EmailService } from './email.service';
import { SendTestEmailDto, SendCustomEmailDto } from './dto/send-email.dto';

@ApiTags('Email')
@Controller('email')
export class EmailController {
  constructor(private emailService: EmailService) {}

  @Post('test/welcome')
  @ApiOperation({ 
    summary: 'Enviar email de bienvenida de prueba',
    description: 'Envía un email de bienvenida para probar la configuración de Resend'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Email enviado exitosamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Error al enviar el email' 
  })
  async testWelcomeEmail(@Body() body: SendTestEmailDto) {
    const result = await this.emailService.sendWelcomeEmail(body.email, body.name);
    return { 
      success: result,
      message: result ? 'Email enviado exitosamente' : 'Error al enviar email'
    };
  }

  @Post('send')
  @ApiOperation({ 
    summary: 'Enviar email personalizado',
    description: 'Envía un email personalizado con el contenido especificado'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Email enviado exitosamente' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Error al enviar el email' 
  })
  async sendCustomEmail(@Body() body: SendCustomEmailDto) {
    const result = await this.emailService.sendEmail({
      to: body.to,
      subject: body.subject,
      text: body.text,
      from: body.from,
    });
    
    return { 
      success: result,
      message: result ? 'Email enviado exitosamente' : 'Error al enviar email'
    };
  }
}
