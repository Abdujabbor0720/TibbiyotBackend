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

  // English titles and body (optional)
  @Column({ type: 'text', nullable: true })
  titleEn: string | null;

  @Column({ type: 'text', nullable: true })
  bodyEn: string | null;

  @Column({ type: 'uuid', nullable: true })
  createdByUserId: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  publishedAt: Date | null;

  @Column({ type: 'boolean', default: false })
  isDraft: boolean;

  /**
   * Direct media URLs from Cloudinary (for simple storage without MediaAsset relation)
   */
  @Column({ type: 'jsonb', nullable: true, default: [] })
  mediaUrls: string[];

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

  /**
   * Get localized title with fallback to Uzbek Latin (uz-lat).
   * 
   * FALLBACK CHAIN:
   * 1. User's preferred language
   * 2. Uzbek Latin (uz-lat) - primary/default language
   */
  getLocalizedTitle(language: string): string {
    // Default fallback is always uz-lat
    const defaultTitle = this.titleUzLat || '';
    
    switch (language) {
      case 'uz_lat':
      case 'uz-lat':
        return this.titleUzLat || '';
      case 'uz_cyr':
      case 'uz-cyr':
        return this.titleUzCyr || defaultTitle;
      case 'ru':
        return this.titleRu || defaultTitle;
      case 'en':
        return this.titleEn || defaultTitle;
      default:
        return defaultTitle;
    }
  }

  /**
   * Get localized body with fallback to Uzbek Latin (uz-lat).
   * 
   * FALLBACK CHAIN:
   * 1. User's preferred language
   * 2. Uzbek Latin (uz-lat) - primary/default language
   */
  getLocalizedBody(language: string): string {
    // Default fallback is always uz-lat
    const defaultBody = this.bodyUzLat || '';
    
    switch (language) {
      case 'uz_lat':
      case 'uz-lat':
        return this.bodyUzLat || '';
      case 'uz_cyr':
      case 'uz-cyr':
        return this.bodyUzCyr || defaultBody;
      case 'ru':
        return this.bodyRu || defaultBody;
      case 'en':
        return this.bodyEn || defaultBody;
      default:
        return defaultBody;
    }
  }
}
