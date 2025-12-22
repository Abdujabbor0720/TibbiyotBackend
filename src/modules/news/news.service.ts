import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not, LessThanOrEqual } from 'typeorm';
import { NewsPost, MediaAsset } from '../../database/entities';
import { MediaOwnerType, Language } from '../../database/enums';
import {
  CreateNewsDto,
  UpdateNewsDto,
  NewsQueryDto,
  PaginatedResponse,
  NewsResponseDto,
  LocalizedNewsResponseDto,
  NewsListItemDto,
  MediaAssetResponseDto,
} from './dto';

@Injectable()
export class NewsService {
  private readonly logger = new Logger(NewsService.name);

  constructor(
    @InjectRepository(NewsPost)
    private readonly newsRepository: Repository<NewsPost>,
    @InjectRepository(MediaAsset)
    private readonly mediaRepository: Repository<MediaAsset>,
  ) {}

  /**
   * Create a new news post.
   * Admin only.
   */
  async create(dto: CreateNewsDto, userId: string): Promise<NewsResponseDto> {
    const news = this.newsRepository.create({
      titleUzLat: dto.titleUzLat,
      titleUzCyr: dto.titleUzCyr,
      titleRu: dto.titleRu,
      bodyUzLat: dto.bodyUzLat,
      bodyUzCyr: dto.bodyUzCyr,
      bodyRu: dto.bodyRu,
      isDraft: dto.isDraft ?? false,
      publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : (dto.isDraft ? null : new Date()),
      createdByUserId: userId,
    });

    const saved = await this.newsRepository.save(news);

    // Link media assets if provided
    if (dto.mediaAssetIds && dto.mediaAssetIds.length > 0) {
      await this.mediaRepository.update(
        { id: (await import('typeorm')).In(dto.mediaAssetIds) },
        { ownerId: saved.id, ownerType: MediaOwnerType.NEWS },
      );
    }

    this.logger.log(`Created news: ${saved.id}`);
    return this.findByIdAdmin(saved.id);
  }

  /**
   * Update a news post.
   * Admin only.
   */
  async update(id: string, dto: UpdateNewsDto): Promise<NewsResponseDto> {
    const news = await this.newsRepository.findOne({ where: { id } });

    if (!news) {
      throw new NotFoundException('News not found');
    }

    // Update fields
    if (dto.titleUzLat !== undefined) news.titleUzLat = dto.titleUzLat;
    if (dto.titleUzCyr !== undefined) news.titleUzCyr = dto.titleUzCyr;
    if (dto.titleRu !== undefined) news.titleRu = dto.titleRu;
    if (dto.bodyUzLat !== undefined) news.bodyUzLat = dto.bodyUzLat;
    if (dto.bodyUzCyr !== undefined) news.bodyUzCyr = dto.bodyUzCyr;
    if (dto.bodyRu !== undefined) news.bodyRu = dto.bodyRu;
    if (dto.isDraft !== undefined) news.isDraft = dto.isDraft;
    if (dto.publishedAt !== undefined) {
      news.publishedAt = dto.publishedAt ? new Date(dto.publishedAt) : null;
    }

    const updated = await this.newsRepository.save(news);

    // Update media assets if provided
    if (dto.mediaAssetIds !== undefined) {
      // Unlink existing media
      await this.mediaRepository.update(
        { ownerId: id, ownerType: MediaOwnerType.NEWS },
        { ownerId: null as unknown as string },
      );
      
      // Link new media
      if (dto.mediaAssetIds.length > 0) {
        await this.mediaRepository.update(
          { id: (await import('typeorm')).In(dto.mediaAssetIds) },
          { ownerId: updated.id, ownerType: MediaOwnerType.NEWS },
        );
      }
    }

    this.logger.log(`Updated news: ${id}`);
    return this.findByIdAdmin(updated.id);
  }

  /**
   * Delete a news post.
   * Admin only.
   */
  async delete(id: string): Promise<void> {
    const news = await this.newsRepository.findOne({ where: { id } });

    if (!news) {
      throw new NotFoundException('News not found');
    }

    await this.newsRepository.remove(news);
    this.logger.log(`Deleted news: ${id}`);
  }

  /**
   * Get news by ID for admin (full details).
   */
  async findByIdAdmin(id: string): Promise<NewsResponseDto> {
    const news = await this.newsRepository.findOne({
      where: { id },
      relations: ['mediaAssets'],
    });

    if (!news) {
      throw new NotFoundException('News not found');
    }

    return this.toAdminResponseDto(news);
  }

  /**
   * Get all news for admin.
   */
  async findAllAdmin(query: NewsQueryDto): Promise<PaginatedResponse<NewsResponseDto>> {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const [items, total] = await this.newsRepository.findAndCount({
      relations: ['mediaAssets'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      items: items.map((n) => this.toAdminResponseDto(n)),
      total,
      page,
      limit,
      totalPages,
      hasMore: page < totalPages,
    };
  }

  /**
   * Get published news by ID (public, localized).
   */
  async findByIdPublic(id: string, language: Language): Promise<LocalizedNewsResponseDto> {
    const news = await this.newsRepository.findOne({
      where: {
        id,
        isDraft: false,
        publishedAt: LessThanOrEqual(new Date()),
      },
      relations: ['mediaAssets'],
    });

    if (!news) {
      throw new NotFoundException('News not found');
    }

    return this.toLocalizedResponseDto(news, language);
  }

  /**
   * Get all published news (public, paginated).
   */
  async findAllPublic(query: NewsQueryDto, language: Language): Promise<PaginatedResponse<NewsListItemDto>> {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const [items, total] = await this.newsRepository.findAndCount({
      where: {
        isDraft: false,
        publishedAt: LessThanOrEqual(new Date()),
      },
      relations: ['mediaAssets'],
      order: { publishedAt: 'DESC' },
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      items: items.map((n) => this.toListItemDto(n, language)),
      total,
      page,
      limit,
      totalPages,
      hasMore: page < totalPages,
    };
  }

  /**
   * Get latest published news (for WebApp home).
   */
  async getLatest(count: number, language: Language): Promise<LocalizedNewsResponseDto[]> {
    const items = await this.newsRepository.find({
      where: {
        isDraft: false,
        publishedAt: LessThanOrEqual(new Date()),
      },
      relations: ['mediaAssets'],
      order: { publishedAt: 'DESC' },
      take: count,
    });

    return items.map((n) => this.toLocalizedResponseDto(n, language));
  }

  /**
   * Convert to admin response DTO.
   */
  private toAdminResponseDto(news: NewsPost): NewsResponseDto {
    return {
      id: news.id,
      titleUzLat: news.titleUzLat,
      titleUzCyr: news.titleUzCyr,
      titleRu: news.titleRu,
      bodyUzLat: news.bodyUzLat,
      bodyUzCyr: news.bodyUzCyr,
      bodyRu: news.bodyRu,
      isDraft: news.isDraft,
      publishedAt: news.publishedAt,
      createdByUserId: news.createdByUserId,
      mediaAssets: (news.mediaAssets || []).map(this.toMediaAssetDto),
      createdAt: news.createdAt,
      updatedAt: news.updatedAt,
    };
  }

  /**
   * Convert to localized response DTO.
   */
  private toLocalizedResponseDto(news: NewsPost, language: Language): LocalizedNewsResponseDto {
    return {
      id: news.id,
      title: news.getLocalizedTitle(language),
      body: news.getLocalizedBody(language),
      publishedAt: news.publishedAt,
      mediaAssets: (news.mediaAssets || []).map(this.toMediaAssetDto),
      createdAt: news.createdAt,
    };
  }

  /**
   * Convert to list item DTO (summary).
   */
  private toListItemDto(news: NewsPost, language: Language): NewsListItemDto {
    const body = news.getLocalizedBody(language);
    const excerpt = body.length > 200 ? body.substring(0, 200) + '...' : body;

    return {
      id: news.id,
      title: news.getLocalizedTitle(language),
      excerpt,
      publishedAt: news.publishedAt,
      hasMedia: (news.mediaAssets || []).length > 0,
      createdAt: news.createdAt,
    };
  }

  /**
   * Convert media asset to DTO.
   */
  private toMediaAssetDto(media: MediaAsset): MediaAssetResponseDto {
    return {
      id: media.id,
      type: media.type,
      url: media.url,
      mimeType: media.mimeType,
      originalFilename: media.originalFilename,
    };
  }
}
