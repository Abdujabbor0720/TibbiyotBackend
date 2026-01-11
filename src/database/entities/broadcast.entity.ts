import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { BroadcastStatus } from '../enums';
import { User } from './user.entity';

/**
 * Broadcast job entity for tracking broadcast messages.
 * Contains metadata about the broadcast, NOT the message content.
 */
@Entity('broadcasts')
@Index(['status'])
@Index(['createdAt'])
export class Broadcast {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  createdByUserId: string | null;

  @Column({
    type: 'enum',
    enum: BroadcastStatus,
    default: BroadcastStatus.PENDING,
  })
  status: BroadcastStatus;

  /**
   * Total number of users to receive the broadcast.
   */
  @Column({ type: 'int', default: 0 })
  totalRecipients: number;

  /**
   * Number of successfully delivered messages.
   */
  @Column({ type: 'int', default: 0 })
  successCount: number;

  /**
   * Number of failed deliveries.
   */
  @Column({ type: 'int', default: 0 })
  failureCount: number;

  /**
   * Bull job ID for tracking.
   */
  @Column({ type: 'text', nullable: true })
  jobId: string | null;

  /**
   * Error message if broadcast failed.
   */
  @Column({ type: 'text', nullable: true })
  errorMessage: string | null;

  /**
   * Media URLs for broadcast (Cloudinary URLs).
   */
  @Column({ type: 'jsonb', nullable: true })
  mediaUrls: string[] | null;

  @Column({ type: 'timestamptz', nullable: true })
  startedAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  completedAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'createdByUserId' })
  createdBy: User;
}
