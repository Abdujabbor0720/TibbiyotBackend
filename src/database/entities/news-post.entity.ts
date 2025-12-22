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

@Entity('news_posts')
@Index(['publishedAt'])
@Index(['createdAt'])
export class NewsPost {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Uzbek Latin titles and body
  @Column({ type: 'text' })
  titleUzLat: string;

  @Column({ type: 'text' })
  bodyUzLat: string;

  // Uzbek Cyrillic titles and body
  @Column({ type: 'text' })
  titleUzCyr: string;

  @Column({ type: 'text' })
  bodyUzCyr: string;

  // Russian titles and body
  @Column({ type: 'text' })
  titleRu: string;

  @Column({ type: 'text' })
  bodyRu: string;

  @Column({ type: 'uuid', nullable: true })
  createdByUserId: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  publishedAt: Date | null;

  @Column({ type: 'boolean', default: false })
  isDraft: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  // Relations
  @ManyToOne('User', 'newsPosts', { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'createdByUserId' })
  createdBy: any;

  @OneToMany('MediaAsset', 'newsPost')
  mediaAssets: any[];

  // Helper method to get localized content
  getLocalizedTitle(language: string): string {
    switch (language) {
      case 'uz_cyr':
        return this.titleUzCyr;
      case 'ru':
        return this.titleRu;
      default:
        return this.titleUzLat;
    }
  }

  getLocalizedBody(language: string): string {
    switch (language) {
      case 'uz_cyr':
        return this.bodyUzCyr;
      case 'ru':
        return this.bodyRu;
      default:
        return this.bodyUzLat;
    }
  }
}
