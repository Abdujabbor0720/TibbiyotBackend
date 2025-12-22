import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Bot session state for tracking user interactions.
 * Used for conversation flow management in the bot.
 */
@Entity('bot_sessions')
@Index(['telegramUserId'], { unique: true })
@Index(['expiresAt'])
export class BotSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'bigint', unique: true })
  telegramUserId: string;

  /**
   * Current state in the conversation flow.
   * e.g., 'awaiting_language', 'awaiting_first_name', 'chatting_with_contact'
   */
  @Column({ type: 'text', nullable: true })
  currentState: string | null;

  /**
   * Active contact ID if user is in a conversation.
   */
  @Column({ type: 'uuid', nullable: true })
  activeContactId: string | null;

  /**
   * Active conversation ID.
   */
  @Column({ type: 'uuid', nullable: true })
  activeConversationId: string | null;

  /**
   * Session data as JSON for flexible state storage.
   */
  @Column({ type: 'jsonb', nullable: true })
  data: Record<string, unknown> | null;

  /**
   * Session expiration time.
   */
  @Column({ type: 'timestamptz', nullable: true })
  expiresAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
