import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { ContactStatus } from '../enums';

@Entity('contacts')
@Index(['telegramUserId'], { unique: true })
@Index(['status'])
@Index(['isActive'])
export class Contact {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  fullName: string;

  @Column({ type: 'bigint', unique: true, nullable: true })
  telegramUserId: string | null; // Store as string to handle bigint in JS

  @Column({ type: 'text', nullable: true })
  position: string | null;

  @Column({ type: 'text', nullable: true })
  department: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    type: 'enum',
    enum: ContactStatus,
    default: ContactStatus.ACTIVE,
  })
  status: ContactStatus;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @Column({ type: 'text', nullable: true })
  photoUrl: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  // Relations
  @OneToMany('Conversation', 'contact')
  conversations: any[];
}
