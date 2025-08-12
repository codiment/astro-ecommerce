import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { PrismaService } from '../prisma/prisma.service';

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

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.fromEmail = this.configService.get<string>('FROM_EMAIL') || 'onboarding@resend.dev';
    
    if (!apiKey) {
      this.logger.warn('RESEND_API_KEY not found. Email service will not work.');
      return;
    }

    this.resend = new Resend(apiKey);
    this.logger.log('Email service initialized with Resend');
  }

  private async checkEmailAlreadySent(
    recipient: string,
    emailType: string,
    relatedEntityId?: number,
    idempotencyKey?: string,
  ): Promise<boolean> {
    try {
      // Verificar por idempotency key si se proporciona
      if (idempotencyKey) {
        const existingByKey = await this.prisma.emailLog.findFirst({
          where: { idempotencyKey },
        });
        if (existingByKey) {
          this.logger.log(`Email already sent with idempotency key: ${idempotencyKey}`);
          return true;
        }
      }

      // Verificar por combinación única de recipient, emailType y relatedEntityId
      const existing = await this.prisma.emailLog.findFirst({
        where: {
          recipient,
          emailType,
          relatedEntityId,
        },
      });

      if (existing) {
        this.logger.log(`Email already sent: ${emailType} to ${recipient} for entity ${relatedEntityId}`);
        return true;
      }

      return false;
    } catch (error) {
      this.logger.error('Error checking email log:', error);
      // En caso de error, permitir el envío para no bloquear funcionalidad crítica
      return false;
    }
  }

  private async logEmailSent(
    recipient: string,
    emailType: string,
    subject: string,
    relatedEntityId?: number,
    idempotencyKey?: string,
  ): Promise<void> {
    try {
      await this.prisma.emailLog.create({
        data: {
          recipient,
          emailType,
          subject,
          relatedEntityId,
          idempotencyKey,
        },
      });
      this.logger.log(`Email logged: ${emailType} to ${recipient}`);
    } catch (error) {
      this.logger.error('Error logging email:', error);
      // No lanzar error para no afectar el flujo principal
    }
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

  async sendWelcomeEmail(
    email: string, 
    name: string, 
    userId?: number,
    idempotencyKey?: string
  ): Promise<boolean> {
    // Verificar si ya se envió este email
    const alreadySent = await this.checkEmailAlreadySent(
      email,
      'WELCOME',
      userId,
      idempotencyKey,
    );

    if (alreadySent) {
      this.logger.log(`Welcome email already sent to ${email}`);
      return true; // Retornar true porque el email ya fue enviado exitosamente
    }

    const text = `Hola ${name},

Gracias por registrarte en nuestro E-commerce. Estamos emocionados de tenerte como parte de nuestra comunidad.

Ahora puedes:
- Explorar nuestros productos
- Agregar items a tu carrito
- Realizar compras seguras

¡Feliz compra!
El equipo de E-commerce`;

    const subject = '¡Bienvenido a nuestro E-commerce!';
    const success = await this.sendEmail({
      to: email,
      subject,
      text,
    });

    if (success) {
      await this.logEmailSent(email, 'WELCOME', subject, userId, idempotencyKey);
    }

    return success;
  }

  async sendOrderConfirmationEmail(
    email: string, 
    orderData: OrderEmailData,
    idempotencyKey?: string
  ): Promise<boolean> {
    // Verificar si ya se envió este email
    const alreadySent = await this.checkEmailAlreadySent(
      email,
      'ORDER_CONFIRMATION',
      orderData.orderId,
      idempotencyKey,
    );

    if (alreadySent) {
      this.logger.log(`Order confirmation email already sent for order ${orderData.orderId}`);
      return true;
    }

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

    const subject = `Confirmación de Pedido #${orderData.orderId}`;
    const success = await this.sendEmail({
      to: email,
      subject,
      text,
    });

    if (success) {
      await this.logEmailSent(email, 'ORDER_CONFIRMATION', subject, orderData.orderId, idempotencyKey);
    }

    return success;
  }

  async sendOrderStatusUpdateEmail(
    email: string,
    customerName: string,
    orderId: number,
    status: string,
    idempotencyKey?: string,
  ): Promise<boolean> {
    // Para status updates, incluir el status en el tipo para permitir múltiples updates
    const emailType = `ORDER_STATUS_UPDATE_${status}`;
    
    // Verificar si ya se envió este email específico
    const alreadySent = await this.checkEmailAlreadySent(
      email,
      emailType,
      orderId,
      idempotencyKey,
    );

    if (alreadySent) {
      this.logger.log(`Order status update email already sent for order ${orderId} with status ${status}`);
      return true;
    }

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

    const subject = `Actualización de Pedido #${orderId}`;
    const success = await this.sendEmail({
      to: email,
      subject,
      text,
    });

    if (success) {
      await this.logEmailSent(email, emailType, subject, orderId, idempotencyKey);
    }

    return success;
  }
}

