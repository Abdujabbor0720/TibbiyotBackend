import {
  Controller,
  Post,
  Delete,
  Param,
  ParseUUIDPipe,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService, MediaUploadResult } from './media.service';
import { JwtAuthGuard, AdminGuard } from '../../common/guards';

/**
 * Admin media controller.
 * Handles file uploads for news media.
 */
@Controller('admin/uploads')
@UseGuards(JwtAuthGuard, AdminGuard)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  /**
   * Upload a media file.
   * Admin only.
   * 
   * Accepts: images (jpeg, png, gif, webp), videos (mp4, webm), audio (mp3, ogg)
   * Max size: configured via MAX_FILE_SIZE env var (default 10MB)
   */
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<MediaUploadResult> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    return this.mediaService.upload({
      buffer: file.buffer,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    });
  }

  /**
   * Delete a media file.
   * Admin only.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.mediaService.delete(id);
  }
}
