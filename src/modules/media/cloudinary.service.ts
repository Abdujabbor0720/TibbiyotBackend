import {
  Injectable,
  BadRequestException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { Readable } from 'stream';

export interface CloudinaryUploadResult {
  publicId: string;
  url: string;
  secureUrl: string;
  format: string;
  resourceType: string;
  bytes: number;
  width?: number;
  height?: number;
  duration?: number;
}

@Injectable()
export class CloudinaryService implements OnModuleInit {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');

    if (!cloudName || !apiKey || !apiSecret) {
      this.logger.error('Missing Cloudinary credentials in environment variables');
      throw new Error('Cloudinary credentials not configured');
    }

    // Configure Cloudinary
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });

    this.logger.log('Cloudinary configured successfully');
  }

  /**
   * Upload a file buffer to Cloudinary
   */
  async uploadBuffer(
    buffer: Buffer,
    options: {
      folder?: string;
      publicId?: string;
      resourceType?: 'image' | 'video' | 'raw' | 'auto';
      transformation?: object;
    } = {},
  ): Promise<CloudinaryUploadResult> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: options.folder || 'tsdi-uploads',
          public_id: options.publicId,
          resource_type: options.resourceType || 'auto',
          transformation: options.transformation,
        },
        (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (error) {
            this.logger.error('Cloudinary upload failed', error);
            reject(new BadRequestException(`Upload failed: ${error.message}`));
          } else if (result) {
            this.logger.log(`Cloudinary upload successful: ${result.public_id}`);
            resolve({
              publicId: result.public_id,
              url: result.url,
              secureUrl: result.secure_url,
              format: result.format,
              resourceType: result.resource_type,
              bytes: result.bytes,
              width: result.width,
              height: result.height,
              duration: result.duration,
            });
          }
        },
      );

      // Convert buffer to stream and pipe to upload
      const readableStream = new Readable();
      readableStream.push(buffer);
      readableStream.push(null);
      readableStream.pipe(uploadStream);
    });
  }

  /**
   * Upload a file from URL to Cloudinary
   */
  async uploadFromUrl(
    url: string,
    options: {
      folder?: string;
      publicId?: string;
      resourceType?: 'image' | 'video' | 'raw' | 'auto';
    } = {},
  ): Promise<CloudinaryUploadResult> {
    try {
      const result = await cloudinary.uploader.upload(url, {
        folder: options.folder || 'tsdi-uploads',
        public_id: options.publicId,
        resource_type: options.resourceType || 'auto',
      });

      this.logger.log(`Cloudinary upload from URL successful: ${result.public_id}`);

      return {
        publicId: result.public_id,
        url: result.url,
        secureUrl: result.secure_url,
        format: result.format,
        resourceType: result.resource_type,
        bytes: result.bytes,
        width: result.width,
        height: result.height,
        duration: result.duration,
      };
    } catch (error: any) {
      this.logger.error('Cloudinary upload from URL failed', error);
      throw new BadRequestException(`Upload failed: ${error.message}`);
    }
  }

  /**
   * Delete a file from Cloudinary
   */
  async delete(publicId: string, resourceType: 'image' | 'video' | 'raw' = 'image'): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
      this.logger.log(`Cloudinary delete successful: ${publicId}`);
    } catch (error: any) {
      this.logger.warn(`Cloudinary delete failed: ${publicId}`, error.message);
    }
  }

  /**
   * Get optimized URL for an image
   */
  getOptimizedUrl(publicId: string, options: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string | number;
    format?: string;
  } = {}): string {
    return cloudinary.url(publicId, {
      fetch_format: options.format || 'auto',
      quality: options.quality || 'auto',
      width: options.width,
      height: options.height,
      crop: options.crop || 'auto',
      gravity: 'auto',
    });
  }

  /**
   * Get thumbnail URL
   */
  getThumbnailUrl(publicId: string, width: number = 200, height: number = 200): string {
    return cloudinary.url(publicId, {
      fetch_format: 'auto',
      quality: 'auto',
      width,
      height,
      crop: 'fill',
      gravity: 'auto',
    });
  }

  /**
   * Get video thumbnail URL
   */
  getVideoThumbnailUrl(publicId: string, width: number = 400, height: number = 300): string {
    return cloudinary.url(publicId, {
      resource_type: 'video',
      fetch_format: 'jpg',
      quality: 'auto',
      width,
      height,
      crop: 'fill',
      gravity: 'auto',
    });
  }
}
