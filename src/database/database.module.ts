import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  User,
  Contact,
  NewsPost,
  MediaAsset,
  Conversation,
  Message,
  AuditLog,
  Broadcast,
  BotSession,
} from './entities';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = process.env.DATABASE_URL;
        
        // If DATABASE_URL is provided (Render), use it directly
        if (databaseUrl) {
          return {
            type: 'postgres' as const,
            url: databaseUrl,
            ssl: {
              rejectUnauthorized: false, // Required for Render
            },
            entities: [
              User,
              Contact,
              NewsPost,
              MediaAsset,
              Conversation,
              Message,
              AuditLog,
              Broadcast,
              BotSession,
            ],
            synchronize: true, // Auto-sync schema on Render
            logging: false,
            extra: {
              max: 10,
              min: 2,
              idleTimeoutMillis: 30000,
              connectionTimeoutMillis: 5000,
            },
          };
        }
        
        // Local development - use individual config values
        return {
          type: 'postgres' as const,
          host: configService.get<string>('database.host')!,
          port: configService.get<number>('database.port')!,
          username: configService.get<string>('database.user')!,
          password: configService.get<string>('database.password')!,
          database: configService.get<string>('database.name')!,
          ssl: false,
          entities: [
            User,
            Contact,
            NewsPost,
            MediaAsset,
            Conversation,
            Message,
            AuditLog,
            Broadcast,
            BotSession,
          ],
          synchronize: configService.get<boolean>('database.synchronize'),
          logging: configService.get<boolean>('database.logging'),
          extra: {
            max: 20,
            min: 5,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 5000,
          },
        };
      },
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
