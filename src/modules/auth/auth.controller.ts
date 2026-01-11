import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { AuthService, AuthResponse } from './auth.service';
import { TelegramAuthDto, DevAuthDto } from './dto';
import { TelegramWebAppGuard } from '../../common/guards';
import { TelegramUser } from '../../common/decorators';
import type { TelegramWebAppUser } from '../../common/utils/telegram-auth.util';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Authenticate via Telegram WebApp.
   * 
   * Flow:
   * 1. TelegramWebAppGuard verifies initData using HMAC SHA-256
   * 2. If valid, extracts Telegram user from initData
   * 3. Creates/updates user in database
   * 4. Returns JWT token for subsequent requests
   * 
   * Security notes:
   * - Rate limited to prevent brute force
   * - initData has max age (default 5 minutes)
   * - Admin status determined server-side only
   */
  @Post('telegram-webapp')
  @UseGuards(TelegramWebAppGuard)
  @Throttle({ default: { ttl: 60000, limit: 10 } }) // Stricter rate limit for auth
  @HttpCode(HttpStatus.OK)
  async authenticateWithTelegram(
    @Body() _dto: TelegramAuthDto, // For validation only
    @TelegramUser() telegramUser: TelegramWebAppUser,
  ): Promise<AuthResponse> {
    return this.authService.authenticateWithTelegram(telegramUser);
  }

  /**
   * Development-only authentication endpoint.
   * Allows testing without Telegram WebApp.
   * 
   * SECURITY: Only works in development mode (NODE_ENV !== 'production')
   */
  @Post('dev-login')
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @HttpCode(HttpStatus.OK)
  async devLogin(@Body() dto: DevAuthDto): Promise<AuthResponse> {
    const isProduction = this.configService.get('app.isProduction');
    
    if (isProduction) {
      this.logger.warn('Dev login attempt blocked in production');
      throw new ForbiddenException('Development endpoint not available in production');
    }

    this.logger.log(`Dev login: telegramUserId=${dto.telegramUserId}`);
    
    // Create mock telegram user
    const mockTelegramUser: TelegramWebAppUser = {
      id: parseInt(dto.telegramUserId, 10),
      first_name: dto.firstName || 'Dev',
      last_name: dto.lastName || 'User',
      username: dto.username || 'dev_user',
      language_code: dto.languageCode || 'uz',
    };

    return this.authService.authenticateWithTelegram(mockTelegramUser);
  }
}
