import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService, AuthResponse } from './auth.service';
import { TelegramAuthDto } from './dto';
import { TelegramWebAppGuard } from '../../common/guards';
import { TelegramUser } from '../../common/decorators';
import type { TelegramWebAppUser } from '../../common/utils/telegram-auth.util';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
}
