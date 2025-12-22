import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Language, UserRole } from '../enums';

@Entity('users')
@Index(['telegramUserId'], { unique: true })
@Index(['role'])
@Index(['botStartedAt'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'bigint', unique: true })
  telegramUserId: string; // Store as string to handle bigint in JS

  @Column({ type: 'text', nullable: true })
  username: string | null;

  @Column({ type: 'text' })
  firstName: string;

  @Column({ type: 'text' })
  lastName: string;

  @Column({
    type: 'enum',
    enum: Language,
    default: Language.UZ_LAT,
  })
  language: Language;

  @Column({ type: 'smallint', nullable: true })
  course: number | null;

  @Column({ type: 'text', nullable: true })
  major: string | null;

  @Column({ type: 'smallint', nullable: true })
  age: number | null;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.STUDENT,
  })
  role: UserRole;

  @Column({ type: 'timestamptz', nullable: true })
  botStartedAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  // Relations - using string-based relations to avoid circular dependency
  @OneToMany('NewsPost', 'createdBy')
  newsPosts: any[];

  @OneToMany('Conversation', 'student')
  conversations: any[];

  @OneToMany('AuditLog', 'actor')
  auditLogs: any[];

  // Computed property
  get isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }
}
