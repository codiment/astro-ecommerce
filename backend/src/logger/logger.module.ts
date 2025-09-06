import { Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { IncomingMessage, ServerResponse } from 'http';
import * as os from 'os';

@Module({
  imports: [
    PinoLoggerModule.forRoot({
      pinoHttp: {
        // Logging level according to environment
        level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',

        // Transport for development (pino-pretty)
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

        // Custom serializers
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

        // Dynamic log level according to status code
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

        // Custom messages
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

        // Timestamp for production
        timestamp:
          process.env.NODE_ENV === 'production'
            ? () => `,"time":"${new Date().toISOString()}"`
            : undefined,

        // Base context information
        base: {
          pid: process.pid,
          hostname: os.hostname(),
          env: process.env.NODE_ENV || 'development',
        },

        // ✅ Additional configuration to filter warnings
        hooks: {
          logMethod(
            inputArgs: unknown[],
            method: (...args: unknown[]) => void,
            level: number,
          ): void {
            // Filter specific warning from path-to-regexp
            if (
              level === 40 &&
              typeof inputArgs[0] === 'string' &&
              inputArgs[0].includes('Unsupported route path')
            ) {
              return; // Do not log this warning
            }
            method.apply(this, inputArgs);
          },
        },

        // Formatting configuration
        formatters: {
          level: (label) => ({ level: label.toUpperCase() }),
        },
      },
    }),
  ],
  exports: [PinoLoggerModule],
})
export class LoggerModule {}
