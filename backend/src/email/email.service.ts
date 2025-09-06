import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import type { CreateEmailOptions } from 'resend';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
}

export interface OrderEmailData {
  customerName: string;
  orderId: number;
  orderTotal: number;
  items: Array<{
    title: string;
    quantity: number;
    price: number;
  }>;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend;
  private fromEmail: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.fromEmail =
      this.configService.get<string>('FROM_EMAIL') || 'onboarding@resend.dev';

    if (!apiKey) {
      this.logger.warn(
        'RESEND_API_KEY not found. Email service will not work.',
      );
      return;
    }

    this.resend = new Resend(apiKey);
    this.logger.log('Email service initialized with Resend');
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.resend) {
      this.logger.error('Resend not initialized. Cannot send email.');
      return false;
    }

    if (!options.html && !options.text) {
      this.logger.error('Either html or text must be provided');
      return false;
    }

    try {
      const emailData: CreateEmailOptions = {
        from: options.from || this.fromEmail,
        to: options.to,
        subject: options.subject,
        ...(options.html && { html: options.html }),
        ...(options.text && { text: options.text }),
      } as CreateEmailOptions;

      const { data, error } = await this.resend.emails.send(emailData);

      if (error) {
        this.logger.error('Error sending email:', error);
        return false;
      }

      this.logger.log(`Email sent successfully. ID: ${data?.id}`);
      return true;
    } catch (error: any) {
      this.logger.error('Failed to send email:', error);
      return false;
    }
  }

  async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    const text = `Hello ${name},

Thank you for registering at our E-commerce. We are excited to have you as part of our community.

Now you can:
- Explore our products
- Add items to your cart
- Make secure purchases

Happy shopping!
The E-commerce Team`;

    return this.sendEmail({
      to: email,
      subject: 'Welcome to our E-commerce!',
      text,
    });
  }

  async sendOrderConfirmationEmail(
    email: string,
    orderData: OrderEmailData,
  ): Promise<boolean> {
    const itemsList = orderData.items
      .map(
        (item) =>
          `- ${item.title} x${item.quantity} - $${(
            item.quantity * item.price
          ).toFixed(2)}`,
      )
      .join('\n');

    const text = `Hello ${orderData.customerName},

Your order #${orderData.orderId} has been confirmed and is being processed.

Order details:
${itemsList}

Total: $${orderData.orderTotal.toFixed(2)}

We will notify you when your order is shipped.

Thank you for your purchase!
The E-commerce Team`;

    return this.sendEmail({
      to: email,
      subject: `Order Confirmation #${orderData.orderId}`,
      text,
    });
  }

  async sendOrderStatusUpdateEmail(
    email: string,
    customerName: string,
    orderId: number,
    status: string,
  ): Promise<boolean> {
    const statusMessages: { [key: string]: string } = {
      PAID: 'Your order has been paid successfully',
      CANCELLED: 'Your order has been cancelled',
      SHIPPED: 'Your order has been shipped',
      DELIVERED: 'Your order has been delivered',
    };

    const message =
      statusMessages[status] ||
      `The status of your order has changed to: ${status}`;

    const text = `Hello ${customerName},

${message}

Order #${orderId}

You can check the full status of your order in your account.

Thank you for choosing us!
The E-commerce Team`;

    return this.sendEmail({
      to: email,
      subject: `Order Update #${orderId}`,
      text,
    });
  }
}
