import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagingService } from './messaging.service';
import { Conversation, Message, User, Contact } from '../../database/entities';

/**
 * Messaging module for secure conversation management.
 * 
 * NOTE: This module does NOT expose HTTP endpoints.
 * Conversations are managed exclusively through the Telegram bot.
 * This is by design for privacy - admin cannot access message contents.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation, Message, User, Contact]),
  ],
  providers: [MessagingService],
  exports: [MessagingService],
})
export class MessagingModule {}
