import { Controller, Post, Body, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { EmailService } from './email.service';
import { SendTestEmailDto, SendCustomEmailDto } from './dto/send-email.dto';

@ApiTags('Email')
@Controller('email')
export class EmailController {
  constructor(private emailService: EmailService) {}

  @Post('test/welcome')
  @ApiOperation({
    summary: 'Send test welcome email',
    description: 'Sends a welcome email to test the Resend configuration',
  })
  @ApiHeader({
    name: 'idempotency-key',
    description: 'Clave única para evitar envíos duplicados',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Email enviado exitosamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Error sending email',
  })
  async testWelcomeEmail(
    @Body() body: SendTestEmailDto,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    const result = await this.emailService.sendWelcomeEmail(
      body.email,
      body.name,
      undefined, // userId no disponible en test
      idempotencyKey,
    );
    return {
      success: result,
      message: result ? 'Email sent successfully' : 'Error sending email',
    };
  }

  @Post('send')
  @ApiOperation({
    summary: 'Send custom email',
    description: 'Sends a custom email with the specified content',
  })
  @ApiHeader({
    name: 'idempotency-key',
    description: 'Clave única para evitar envíos duplicados',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Email enviado exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Error sending email',
  })
  async sendCustomEmail(
    @Body() body: SendCustomEmailDto,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    // Para emails personalizados, usar el idempotency key como identificador único
    if (idempotencyKey) {
      const alreadySent = await this.emailService['checkEmailAlreadySent'](
        Array.isArray(body.to) ? body.to[0] : body.to,
        'CUSTOM',
        undefined,
        idempotencyKey,
      );

      if (alreadySent) {
        return {
          success: true,
          message: 'Email ya fue enviado previamente',
        };
      }
    }

    const result = await this.emailService.sendEmail({
      to: body.to,
      subject: body.subject,
      text: body.text,
      from: body.from,
    });

    // Log del email personalizado si fue exitoso
    if (result && idempotencyKey) {
      await this.emailService['logEmailSent'](
        Array.isArray(body.to) ? body.to[0] : body.to,
        'CUSTOM',
        body.subject,
        undefined,
        idempotencyKey,
      );
    }

    return {
      success: result,
      message: result ? 'Email sent successfully' : 'Error sending email',
    };
  }
}
