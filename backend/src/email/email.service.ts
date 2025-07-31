import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

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
    this.fromEmail = this.configService.get<string>('FROM_EMAIL') || 'onboarding@resend.dev';
    
    if (!apiKey) {
      this.logger.warn('RESEND_API_KEY not found. Email service will not work.');
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
      const emailData: any = {
        from: options.from || this.fromEmail,
        to: options.to,
        subject: options.subject,
      };

      // Solo agregar las propiedades que estén definidas
      if (options.html) {
        emailData.html = options.html;
      }
      
      if (options.text) {
        emailData.text = options.text;
      }

      const { data, error } = await this.resend.emails.send(emailData);

      if (error) {
        this.logger.error('Error sending email:', error);
        return false;
      }

      this.logger.log(`Email sent successfully. ID: ${data?.id}`);
      return true;
    } catch (error) {
      this.logger.error('Failed to send email:', error);
      return false;
    }
  }

  async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    const text = `Hola ${name},

Gracias por registrarte en nuestro E-commerce. Estamos emocionados de tenerte como parte de nuestra comunidad.

Ahora puedes:
- Explorar nuestros productos
- Agregar items a tu carrito
- Realizar compras seguras

¡Feliz compra!
El equipo de E-commerce`;

    return this.sendEmail({
      to: email,
      subject: '¡Bienvenido a nuestro E-commerce!',
      text,
    });
  }

  async sendOrderConfirmationEmail(email: string, orderData: OrderEmailData): Promise<boolean> {
    const itemsList = orderData.items
      .map(item => `- ${item.title} x${item.quantity} - $${(item.quantity * item.price).toFixed(2)}`)
      .join('\n');

    const text = `Hola ${orderData.customerName},

Tu pedido #${orderData.orderId} ha sido confirmado y está siendo procesado.

Detalles del pedido:
${itemsList}

Total: $${orderData.orderTotal.toFixed(2)}

Te notificaremos cuando tu pedido sea enviado.

¡Gracias por tu compra!
El equipo de E-commerce`;

    return this.sendEmail({
      to: email,
      subject: `Confirmación de Pedido #${orderData.orderId}`,
      text,
    });
  }

  async sendOrderStatusUpdateEmail(
    email: string,
    customerName: string,
    orderId: number,
    status: string,
  ): Promise<boolean> {
    const statusMessages = {
      PAID: 'Tu pedido ha sido pagado exitosamente',
      CANCELLED: 'Tu pedido ha sido cancelado',
      SHIPPED: 'Tu pedido ha sido enviado',
      DELIVERED: 'Tu pedido ha sido entregado',
    };

    const message = statusMessages[status] || `El estado de tu pedido ha cambiado a: ${status}`;

    const text = `Hola ${customerName},

${message}

Pedido #${orderId}

Puedes revisar el estado completo de tu pedido en tu cuenta.

¡Gracias por elegirnos!
El equipo de E-commerce`;

    return this.sendEmail({
      to: email,
      subject: `Actualización de Pedido #${orderId}`,
      text,
    });
  }
}

