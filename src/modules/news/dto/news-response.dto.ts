import { MediaType } from '../../../database/enums';

/**
 * Media asset response DTO.
 */
export class MediaAssetResponseDto {
  id: string;
  type: MediaType;
  url: string | null;
  mimeType: string;
  originalFilename: string | null;
}

/**
 * Full news response DTO (admin).
 */
export class NewsResponseDto {
  id: string;
  titleUzLat: string;
  titleUzCyr: string;
  titleRu: string;
  bodyUzLat: string;
  bodyUzCyr: string;
  bodyRu: string;
  isDraft: boolean;
  publishedAt: Date | null;
  createdByUserId: string | null;
  mediaAssets: MediaAssetResponseDto[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Localized news response DTO (public).
 */
export class LocalizedNewsResponseDto {
  id: string;
  title: string;
  body: string;
  publishedAt: Date | null;
  mediaAssets: MediaAssetResponseDto[];
  createdAt: Date;
}

/**
 * News list item (summary).
 */
export class NewsListItemDto {
  id: string;
  title: string;
  excerpt: string;
  publishedAt: Date | null;
  hasMedia: boolean;
  createdAt: Date;
}
