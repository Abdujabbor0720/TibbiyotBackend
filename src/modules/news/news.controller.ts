import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NewsService } from './news.service';
import {
  CreateNewsDto,
  UpdateNewsDto,
  NewsQueryDto,
  PaginatedResponse,
  NewsResponseDto,
  LocalizedNewsResponseDto,
  NewsListItemDto,
} from './dto';
import { JwtAuthGuard, AdminGuard } from '../../common/guards';
import { CurrentUser } from '../../common/decorators';
import { JwtPayload } from '../auth/auth.service';
import { Language } from '../../database/enums';

/**
 * Public news controller.
 * Provides read-only access to published news.
 * No authentication required for public news list.
 */
@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  /**
   * Get all published news (paginated, localized).
   * Public endpoint - no authentication required.
   */
  @Get()
  async findAll(
    @Query() query: NewsQueryDto,
    @Query('language') lang?: string,
  ): Promise<PaginatedResponse<NewsListItemDto>> {
    const language = (lang as Language) || Language.UZ_LAT;
    return this.newsService.findAllPublic(query, language);
  }

  /**
   * Get latest news (for WebApp home).
   * Public endpoint - no authentication required.
   */
  @Get('latest')
  async getLatest(@Query('language') lang?: string): Promise<LocalizedNewsResponseDto[]> {
    const language = (lang as Language) || Language.UZ_LAT;
    return this.newsService.getLatest(5, language);
  }

  /**
   * Get news by ID (localized).
   * Public endpoint - no authentication required.
   */
  @Get(':id')
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('language') lang?: string,
  ): Promise<LocalizedNewsResponseDto> {
    const language = (lang as Language) || Language.UZ_LAT;
    return this.newsService.findByIdPublic(id, language);
  }
}

/**
 * Admin news controller.
 * Provides full CRUD access for admin users.
 */
@Controller('admin/news')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminNewsController {
  constructor(private readonly newsService: NewsService) {}

  /**
   * Get all news (admin view).
   */
  @Get()
  async findAll(@Query() query: NewsQueryDto): Promise<PaginatedResponse<NewsResponseDto>> {
    return this.newsService.findAllAdmin(query);
  }

  /**
   * Get news by ID (admin view).
   */
  @Get(':id')
  async findById(@Param('id', ParseUUIDPipe) id: string): Promise<NewsResponseDto> {
    return this.newsService.findByIdAdmin(id);
  }

  /**
   * Create news post.
   */
  @Post()
  async create(
    @Body() dto: CreateNewsDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<NewsResponseDto> {
    return this.newsService.create(dto, user.sub);
  }

  /**
   * Update news post.
   */
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateNewsDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<NewsResponseDto> {
    return this.newsService.update(id, dto, user.sub);
  }

  /**
   * Delete news post.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    return this.newsService.delete(id, user.sub);
  }
}
