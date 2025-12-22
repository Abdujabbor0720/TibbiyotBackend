import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NewsController, AdminNewsController } from './news.controller';
import { NewsService } from './news.service';
import { NewsPost, MediaAsset } from '../../database/entities';
import { AuthModule } from '../auth';

@Module({
  imports: [
    TypeOrmModule.forFeature([NewsPost, MediaAsset]),
    AuthModule,
  ],
  controllers: [NewsController, AdminNewsController],
  providers: [NewsService],
  exports: [NewsService],
})
export class NewsModule {}
