import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';

@Entity('conversations')
@Index(['studentUserId', 'contactId'], { unique: true })
@Index(['lastMessageAt'])
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  studentUserId: string;

  @Column({ type: 'uuid' })
  contactId: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  lastMessageAt: Date | null;

  // Relations
  @ManyToOne('User', 'conversations', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studentUserId' })
  student: any;

  @ManyToOne('Contact', 'conversations', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'contactId' })
  contact: any;

  @OneToMany('Message', 'conversation')
  messages: any[];
}
