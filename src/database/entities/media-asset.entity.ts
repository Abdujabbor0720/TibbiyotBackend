import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { MediaType, MediaOwnerType } from '../enums';

@Entity('media_assets')
@Index(['ownerType', 'ownerId'])
@Index(['storageKey'])
export class MediaAsset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: MediaOwnerType,
  })
  ownerType: MediaOwnerType;

  @Column({ type: 'uuid' })
  ownerId: string;

  @Column({
    type: 'enum',
    enum: MediaType,
  })
  type: MediaType;

  @Column({ type: 'text' })
  storageKey: string;

  @Column({ type: 'text', nullable: true })
  url: string | null;

  @Column({ type: 'text', nullable: true })
  thumbnailUrl: string | null;

  @Column({ type: 'text' })
  mimeType: string;

  @Column({ type: 'text', nullable: true })
  originalFilename: string | null;

  @Column({ type: 'bigint' })
  sizeBytes: string; // Store as string for bigint safety

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  // Optional relation to news post (when ownerType is NEWS)
  @ManyToOne('NewsPost', 'mediaAssets', {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'ownerId' })
  newsPost: any;
}
