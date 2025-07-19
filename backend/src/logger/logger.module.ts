import { Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { IncomingMessage, ServerResponse } from 'http';
import * as os from 'os';

@Module({
  imports: [
    PinoLoggerModule.forRoot({
      pinoHttp: {
        // Nivel de logging según ambiente
        level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',

        // Transporte para desarrollo (pino-pretty)
        transport:
          process.env.NODE_ENV !== 'production'
            ? {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                  translateTime: 'SYS:standard',
                  ignore: 'pid,hostname',
                  singleLine: true,
                },
              }
            : undefined,

        // Serializadores personalizados
        serializers: {
          req: (req: IncomingMessage & { ip?: string; hostname?: string }) => ({
            method: req.method || 'UNKNOWN',
            url: req.url || '',
            version: req.headers?.['accept-version'],
            hostname: req.hostname,
            remoteAddress: req.ip,
            remotePort: req.socket?.remotePort,
            userAgent: req.headers?.['user-agent'],
          }),
          res: (res: ServerResponse) => ({
            statusCode: res.statusCode,
          }),
        },

        // Nivel de log dinámico según status code
        customLogLevel: (
          req: IncomingMessage,
          res: ServerResponse,
          err?: Error,
        ) => {
          if (res.statusCode >= 400 && res.statusCode < 500) {
            return 'warn';
          } else if (res.statusCode >= 500 || err) {
            return 'error';
          } else if (res.statusCode >= 300 && res.statusCode < 400) {
            return 'silent';
          }
          return 'info';
        },

        // Mensajes personalizados
        customSuccessMessage: (req: IncomingMessage, res: ServerResponse) => {
          if (res.statusCode === 404) {
            return `🔍 Resource not found`;
          }
          return `✅ ${req.method || 'UNKNOWN'} ${req.url || ''}`;
        },

        customErrorMessage: (
          req: IncomingMessage,
          res: ServerResponse,
          err: Error,
        ) => {
          return `❌ ${req.method || 'UNKNOWN'} ${req.url || ''} - ${err.message}`;
        },

        // Timestamp para producción
        timestamp:
          process.env.NODE_ENV === 'production'
            ? () => `,"time":"${new Date().toISOString()}"`
            : undefined,

        // Información base del contexto
        base: {
          pid: process.pid,
          hostname: os.hostname(),
          env: process.env.NODE_ENV || 'development',
        },

        // ✅ Configuración adicional para filtrar warnings
        hooks: {
          logMethod(
            inputArgs: unknown[],
            method: (...args: unknown[]) => void,
            level: number,
          ): void {
            // Filtrar warning específico de path-to-regexp
            if (
              level === 40 &&
              typeof inputArgs[0] === 'string' &&
              inputArgs[0].includes('Unsupported route path')
            ) {
              return; // No loggear este warning
            }
            method.apply(this, inputArgs);
          },
        },

        // Configuración de formateo
        formatters: {
          level: (label) => ({ level: label.toUpperCase() }),
        },
      },
    }),
  ],
  exports: [PinoLoggerModule],
})
export class LoggerModule {}
