import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { verifyTelegramInitData, extractUserFromInitData } from '../utils/telegram-auth.util';

/**
 * Telegram WebApp Guard - verifies initData from Telegram WebApp.
 * Used for initial authentication when user opens the WebApp.
 * 
 * Expects initData in the request body as 'initData' field.
 * 
 * SECURITY NOTES:
 * - Verifies HMAC signature using bot token
 * - Checks expiration time (default 5 minutes)
 * - Attaches verified Telegram user to request
 */
@Injectable()
export class TelegramWebAppGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const { initData } = request.body;

    if (!initData) {
      throw new UnauthorizedException('Missing Telegram initData');
    }

    const botToken = this.configService.get<string>('telegram.botToken');
    const maxAge = this.configService.get<number>('telegram.initDataMaxAge') || 300;

    if (!botToken) {
      throw new Error('Telegram bot token not configured');
    }

    const verifiedData = verifyTelegramInitData(initData, botToken, maxAge);

    if (!verifiedData) {
      throw new UnauthorizedException('Invalid or expired Telegram initData');
    }

    const telegramUser = extractUserFromInitData(verifiedData);

    if (!telegramUser) {
      throw new UnauthorizedException('No user data in Telegram initData');
    }

    // Attach verified Telegram user to request
    request['telegramUser'] = telegramUser;
    request['telegramInitData'] = verifiedData;

    return true;
  }
}
