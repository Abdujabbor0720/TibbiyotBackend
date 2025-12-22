import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { SenderType } from '../enums';

/**
 * Message entity with encrypted text storage.
 * Uses AES-256-GCM for encryption with IV and auth tag per message.
 * 
 * SECURITY NOTE: Never log message content. Only metadata should be logged.
 */
@Entity('messages')
@Index(['conversationId', 'createdAt'])
@Index(['senderTelegramUserId'])
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  conversationId: string;

  @Column({
    type: 'enum',
    enum: SenderType,
  })
  senderType: SenderType;

  @Column({ type: 'bigint' })
  senderTelegramUserId: string;

  /**
   * Encrypted message text (AES-256-GCM).
   * Stored as base64 encoded string.
   */
  @Column({ type: 'text', nullable: true })
  encryptedText: string | null;

  /**
   * Initialization Vector for AES-256-GCM.
   * Stored as hex string (24 characters = 12 bytes).
   */
  @Column({ type: 'text', nullable: true })
  iv: string | null;

  /**
   * Authentication Tag for AES-256-GCM.
   * Stored as hex string (32 characters = 16 bytes).
   */
  @Column({ type: 'text', nullable: true })
  authTag: string | null;

  /**
   * Optional reference to media asset (for attachments).
   */
  @Column({ type: 'uuid', nullable: true })
  mediaAssetId: string | null;

  /**
   * Telegram message ID (for reference/reply mapping).
   */
  @Column({ type: 'bigint', nullable: true })
  telegramMessageId: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  // Relations
  @ManyToOne('Conversation', 'messages', {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'conversationId' })
  conversation: any;
}
