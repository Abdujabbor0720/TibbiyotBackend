import {
  Injectable,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { MediaAsset } from '../../database/entities';
import { MediaType, MediaOwnerType } from '../../database/enums';
import { CloudinaryService, CloudinaryUploadResult } from './cloudinary.service';
import {
  validateFileByMagicBytes,
  validateFileSize,
  FileCategory,
} from '../../common/utils/file-validation.util';

export interface UploadedFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

export interface MediaUploadResult {
  id: string;
  type: MediaType;
  url: string;
  thumbnailUrl?: string;
  mimeType: string;
  originalFilename: string;
  sizeBytes: string;
  publicId: string;
}

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);
  private maxFileSize: number;
  private allowedMimeTypes: string[];

  constructor(
    @InjectRepository(MediaAsset)
    private readonly mediaRepository: Repository<MediaAsset>,
    private readonly configService: ConfigService,
    private readonly cloudinaryService: CloudinaryService,
  ) {
    this.maxFileSize = this.configService.get<number>('upload.maxFileSize') || 52428800; // 50MB
    this.allowedMimeTypes = this.configService.get<string[]>('upload.allowedMimeTypes') || [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/webm',
      'video/quicktime',
      'audio/mpeg',
      'audio/wav',
      'audio/ogg',
    ];
    
    this.logger.log('MediaService initialized with Cloudinary');
  }

  /**
   * Upload a file to Cloudinary.
   * Validates file type by magic bytes and size.
   */
  async upload(file: UploadedFile): Promise<MediaUploadResult> {
    // Validate file size
    if (!validateFileSize(file.size, this.maxFileSize)) {
      throw new BadRequestException(
        `File size exceeds maximum allowed (${Math.round(this.maxFileSize / 1024 / 1024)}MB)`,
      );
    }

    // Validate file type by magic bytes
    const validation = await validateFileByMagicBytes(
      file.buffer,
      this.allowedMimeTypes,
    );

    if (!validation.isValid) {
      throw new BadRequestException(validation.error || 'Invalid file type');
    }

    const uuid = uuidv4();
    const mediaType = this.categoryToMediaType(validation.category as FileCategory);
    const resourceType = this.getCloudinaryResourceType(validation.category as FileCategory);

    // Upload to Cloudinary
    let cloudinaryResult: CloudinaryUploadResult;
    try {
      cloudinaryResult = await this.cloudinaryService.uploadBuffer(file.buffer, {
        folder: `tsdi/${validation.category}`,
        publicId: uuid,
        resourceType,
      });
    } catch (error: any) {
      this.logger.error('Cloudinary upload failed', error);
      throw new BadRequestException('Failed to upload file');
    }

    // Generate thumbnail URL for images and videos
    let thumbnailUrl: string | undefined;
    if (resourceType === 'image') {
      thumbnailUrl = this.cloudinaryService.getThumbnailUrl(cloudinaryResult.publicId);
    } else if (resourceType === 'video') {
      thumbnailUrl = this.cloudinaryService.getVideoThumbnailUrl(cloudinaryResult.publicId);
    }

    // Save to database
    const mediaAsset = this.mediaRepository.create({
      ownerType: MediaOwnerType.NEWS,
      ownerId: null as unknown as string,
      type: mediaType,
      storageKey: cloudinaryResult.publicId,
      url: cloudinaryResult.secureUrl,
      thumbnailUrl,
      mimeType: validation.mimeType!,
      originalFilename: file.originalname,
      sizeBytes: cloudinaryResult.bytes.toString(),
    });

    const saved = await this.mediaRepository.save(mediaAsset);

    this.logger.log(`Uploaded media to Cloudinary: ${saved.id} (${cloudinaryResult.publicId})`);

    return {
      id: saved.id,
      type: saved.type,
      url: saved.url!,
      thumbnailUrl: saved.thumbnailUrl ?? undefined,
      mimeType: saved.mimeType,
      originalFilename: saved.originalFilename!,
      sizeBytes: saved.sizeBytes,
      publicId: cloudinaryResult.publicId,
    };
  }

  /**
   * Upload multiple files
   */
  async uploadMultiple(files: UploadedFile[]): Promise<MediaUploadResult[]> {
    const results: MediaUploadResult[] = [];
    
    for (const file of files) {
      const result = await this.upload(file);
      results.push(result);
    }
    
    return results;
  }

  /**
   * Get optimized URL for a media asset
   */
  getOptimizedUrl(publicId: string, options?: {
    width?: number;
    height?: number;
    quality?: string | number;
  }): string {
    return this.cloudinaryService.getOptimizedUrl(publicId, options);
  }

  /**
   * Delete a media asset.
   */
  async delete(id: string): Promise<void> {
    const media = await this.mediaRepository.findOne({ where: { id } });

    if (!media) {
      return;
    }

    // Delete from Cloudinary
    const resourceType = this.mediaTypeToCloudinaryResource(media.type);
    await this.cloudinaryService.delete(media.storageKey, resourceType);

    // Delete from database
    await this.mediaRepository.remove(media);
    this.logger.log(`Deleted media: ${id}`);
  }

  /**
   * Find media by ID
   */
  async findById(id: string): Promise<MediaAsset | null> {
    return this.mediaRepository.findOne({ where: { id } });
  }

  /**
   * Find media by owner
   */
  async findByOwner(ownerType: MediaOwnerType, ownerId: string): Promise<MediaAsset[]> {
    return this.mediaRepository.find({
      where: { ownerType, ownerId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Update media owner
   */
  async updateOwner(id: string, ownerType: MediaOwnerType, ownerId: string): Promise<void> {
    await this.mediaRepository.update(id, { ownerType, ownerId });
  }

  /**
   * Get Cloudinary resource type from file category
   */
  private getCloudinaryResourceType(category: FileCategory): 'image' | 'video' | 'raw' {
    switch (category) {
      case 'image':
        return 'image';
      case 'video':
        return 'video';
      case 'audio':
        return 'video'; // Cloudinary treats audio as video resource
      default:
        return 'raw';
    }
  }

  /**
   * Convert MediaType to Cloudinary resource type
   */
  private mediaTypeToCloudinaryResource(type: MediaType): 'image' | 'video' | 'raw' {
    switch (type) {
      case MediaType.IMAGE:
        return 'image';
      case MediaType.VIDEO:
      case MediaType.AUDIO:
        return 'video';
      default:
        return 'raw';
    }
  }

  /**
   * Convert file category to MediaType enum.
   */
  private categoryToMediaType(category: FileCategory): MediaType {
    switch (category) {
      case 'image':
        return MediaType.IMAGE;
      case 'video':
        return MediaType.VIDEO;
      case 'audio':
        return MediaType.AUDIO;
      default:
        return MediaType.IMAGE;
    }
  }
}
