import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as express from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);
  const isProduction = configService.get('app.isProduction');

  // Request body size limits (protection against large payloads)
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  
  // Security headers with Helmet
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    crossOriginEmbedderPolicy: false, // Required for Telegram WebApp
  }));

  // CORS configuration - stricter in production
  const corsOrigins = configService.get<string[]>('security.corsOrigins') || [];
  const corsConfig = {
    origin: isProduction 
      ? (corsOrigins.length > 0 ? corsOrigins : false) // Reject if no origins configured in production
      : true, // Allow all in development
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Telegram-Init-Data'],
    credentials: true,
    maxAge: 86400, // Cache preflight for 24 hours
  };
  
  if (isProduction && corsOrigins.length === 0) {
    logger.warn('⚠️ No CORS origins configured in production! API will reject cross-origin requests.');
  }
  
  app.enableCors(corsConfig);

  // Global validation pipe with strict security
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,           // Strip unknown properties
      forbidNonWhitelisted: true, // Throw on unknown properties (prevents injection attacks)
      transform: true,           // Auto-transform types
      transformOptions: {
        enableImplicitConversion: true,
      },
      disableErrorMessages: isProduction, // Hide detailed errors in production
      stopAtFirstError: true,    // Fail fast on validation errors
    }),
  );

  // API prefix
  const apiPrefix = configService.get<string>('app.apiPrefix') || 'api/v1';
  app.setGlobalPrefix(apiPrefix, {
    exclude: ['health', 'health/ready', 'health/live'],
  });

  // Trust proxy for rate limiting behind reverse proxy
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', 1);

  // Start server
  const port = configService.get<number>('app.port') || 3000;
  await app.listen(port);

  logger.log(`🚀 Application running on port ${port}`);
  logger.log(`📋 API prefix: /${apiPrefix}`);
  logger.log(`🌍 Environment: ${configService.get('app.nodeEnv')}`);
}

bootstrap();

