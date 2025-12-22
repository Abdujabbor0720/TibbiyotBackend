import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { memoryStorage } from 'multer';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { CloudinaryService } from './cloudinary.service';
import { MediaAsset } from '../../database/entities';
import { AuthModule } from '../auth';

@Module({
  imports: [
    TypeOrmModule.forFeature([MediaAsset]),
    MulterModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        storage: memoryStorage(), // Store in memory for validation before Cloudinary upload
        limits: {
          fileSize: configService.get('upload.maxFileSize') || 52428800, // 50MB
        },
      }),
    }),
    AuthModule,
  ],
  controllers: [MediaController],
  providers: [MediaService, CloudinaryService],
  exports: [MediaService, CloudinaryService],
})
export class MediaModule {}
