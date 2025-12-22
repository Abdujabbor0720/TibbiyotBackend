import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bull';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';

// Config
import {
  validateEnv,
  appConfig,
  databaseConfig,
  redisConfig,
  telegramConfig,
  jwtConfig,
  encryptionConfig,
  storageConfig,
  uploadConfig,
  throttleConfig,
  broadcastConfig,
  securityConfig,
} from './config';

// Database
import { DatabaseModule } from './database';

// Common
import { GlobalExceptionFilter } from './common/filters';
import { LoggingInterceptor, TransformInterceptor } from './common/interceptors';

// Modules
import { AuthModule } from './modules/auth';
import { UsersModule } from './modules/users';
import { ContactsModule } from './modules/contacts';
import { NewsModule } from './modules/news';
import { MediaModule } from './modules/media';
import { MessagingModule } from './modules/messaging';
import { BroadcastModule } from './modules/broadcast';
import { AuditModule } from './modules/audit';
import { BotModule } from './modules/bot';
import { HealthModule } from './modules/health';
import { AdminModule } from './modules/admin';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
      load: [
        appConfig,
        databaseConfig,
        redisConfig,
        telegramConfig,
        jwtConfig,
        encryptionConfig,
        storageConfig,
        uploadConfig,
        throttleConfig,
        broadcastConfig,
        securityConfig,
      ],
    }),

    // Rate limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            ttl: (config.get<number>('throttle.ttl') || 60) * 1000,
            limit: config.get<number>('throttle.limit') || 100,
          },
        ],
      }),
    }),

    // Bull Queue (Redis)
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get('redis.host'),
          port: config.get('redis.port'),
          password: config.get('redis.password') || undefined,
        },
        defaultJobOptions: {
          removeOnComplete: true,
          removeOnFail: false,
        },
      }),
    }),

    // Database
    DatabaseModule,

    // Feature modules
    AuthModule,
    UsersModule,
    ContactsModule,
    NewsModule,
    MediaModule,
    MessagingModule,
    BroadcastModule,
    AuditModule,
    BotModule,
    HealthModule,
    AdminModule,
  ],
  providers: [
    // Global exception filter
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    // Global rate limiting guard
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // Global logging interceptor
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    // Global response transform interceptor
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {}
