import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { SwaggerTheme, SwaggerThemeNameEnum } from 'swagger-themes';
import { Logger } from 'nestjs-pino';
import cors from '@fastify/cors';
import fastifyCompress from '@fastify/compress';
import fastifyHelmet from '@fastify/helmet';

// Suppress specific Fastify warning regarding legacy route paths
const originalConsoleWarn = console.warn;
console.warn = function (...args) {
  const message = args.join(' ');
  if (
    message.includes('Unsupported route path') &&
    message.includes('LegacyRouteConverter')
  ) {
    return; // Skip logging this warning
  }
  originalConsoleWarn.apply(console, args);
};

const theme = new SwaggerTheme();
const darkCss = theme.getBuffer(SwaggerThemeNameEnum.NORD_DARK);

async function bootstrap() {
  // FastifyAdapter WITHOUT logger config (handled by LoggerModule)
  const fastifyAdapter = new FastifyAdapter({
    logger: false, // ✅ Disable Fastify's native logger
  });

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    fastifyAdapter,
    {
      bufferLogs: true,
    },
  );

  // Use Pino logger configured in LoggerModule
  const logger = app.get(Logger);
  app.useLogger(logger);

  logger.log('🚀 Starting application...', 'Bootstrap');

  // CORS
  await app.register(cors, {
    origin:
      process.env.NODE_ENV === 'production'
        ? ['https://tusitio.com'] // ✅ Adjust for production
        : '*',
    credentials: true,
  });
  logger.log('✅ CORS configured', 'Bootstrap');

  // Helmet (Security headers)
  await app.register(fastifyHelmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: [`'self'`],
        styleSrc: [`'self'`, `'unsafe-inline'`], // For Swagger UI
        scriptSrc: [`'self'`],
        objectSrc: [`'none'`],
        upgradeInsecureRequests: [],
      },
    },
  });
  logger.log('🔒 Helmet configured', 'Bootstrap');

  // Response compression
  await app.register(fastifyCompress, {
    encodings: ['br', 'gzip', 'deflate'],
    threshold: 1024,
    global: true,
    customTypes: /^text\/|\+json$|\+xml$/,
  });
  logger.log('🗜️ Compression configured', 'Bootstrap');

  // Global API prefix
  app.setGlobalPrefix('api');

  // Swagger only in non-production environments
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('E-commerce API')
      .setDescription('The E-commerce API description')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      explorer: true,
      customCss: darkCss,
    });
    logger.log('📚 Swagger available at /api/docs', 'Bootstrap');
  }

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  logger.log('✅ Validation pipes configured', 'Bootstrap');

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');

  logger.log(`🎯 Server running on port ${port}`, 'Bootstrap');
  logger.log(
    `📊 API docs available at http://localhost:${port}/api/docs`,
    'Bootstrap',
  );
}

bootstrap().catch((err) => {
  console.error('❌ Error initializing the application:', err);
  process.exit(1);
});
