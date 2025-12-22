import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { AuditAction, AuditEntityType } from '../enums';

/**
 * Audit log for tracking admin actions.
 * Used for security monitoring and compliance.
 */
@Entity('audit_logs')
@Index(['actorUserId'])
@Index(['action'])
@Index(['entityType', 'entityId'])
@Index(['createdAt'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  actorUserId: string;

  @Column({
    type: 'enum',
    enum: AuditAction,
  })
  action: AuditAction;

  @Column({
    type: 'enum',
    enum: AuditEntityType,
  })
  entityType: AuditEntityType;

  @Column({ type: 'uuid', nullable: true })
  entityId: string | null;

  /**
   * Additional metadata about the action.
   * Should NOT contain sensitive data like message contents.
   */
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown> | null;

  /**
   * IP address of the request (for HTTP requests).
   */
  @Column({ type: 'inet', nullable: true })
  ipAddress: string | null;

  /**
   * User agent string (for HTTP requests).
   */
  @Column({ type: 'text', nullable: true })
  userAgent: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  // Relations
  @ManyToOne('User', 'auditLogs', { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'actorUserId' })
  actor: any;
}
