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
    summary: 'Send test welcome email',
    description: 'Sends a welcome email to test the Resend configuration',
  })
  @ApiResponse({
    status: 200,
    description: 'Email sent successfully',
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
  async testWelcomeEmail(@Body() body: SendTestEmailDto) {
    const result = await this.emailService.sendWelcomeEmail(
      body.email,
      body.name,
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
  @ApiResponse({
    status: 200,
    description: 'Email sent successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Error sending email',
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
      message: result ? 'Email sent successfully' : 'Error sending email',
    };
  }
}
