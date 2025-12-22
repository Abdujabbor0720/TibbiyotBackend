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
          // Connection pool settings
          extra: {
            max: 20, // Maximum connections
            min: 5, // Minimum connections
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
