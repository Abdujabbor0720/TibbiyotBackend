import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../database/entities';
import { Language, UserRole } from '../../database/enums';
import { TelegramWebAppUser } from '../../common/utils/telegram-auth.util';

export interface JwtPayload {
  sub: string; // user id
  telegramUserId: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    telegramUserId: string;
    username: string | null;
    firstName: string;
    lastName: string;
    language: Language;
    role: UserRole;
    isAdmin: boolean;
  };
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Authenticate user via Telegram WebApp.
   * Creates user if not exists, updates existing user data.
   * Returns JWT token and user info.
   */
  async authenticateWithTelegram(
    telegramUser: TelegramWebAppUser,
  ): Promise<AuthResponse> {
    const telegramUserId = telegramUser.id.toString();
    
    // Find or create user
    let user = await this.userRepository.findOne({
      where: { telegramUserId },
    });

    const adminTelegramIds = this.configService.get<string[]>('telegram.adminTelegramIds') || [];
    const isAdmin = adminTelegramIds.includes(telegramUserId);
    
    this.logger.debug(`Auth check - telegramUserId: ${telegramUserId}, adminTelegramIds: [${adminTelegramIds.join(', ')}], isAdmin: ${isAdmin}`);

    if (!user) {
      // Create new user
      user = this.userRepository.create({
        telegramUserId,
        username: telegramUser.username || null,
        firstName: telegramUser.first_name,
        lastName: telegramUser.last_name || telegramUser.first_name,
        language: this.mapLanguageCode(telegramUser.language_code),
        role: isAdmin ? UserRole.ADMIN : UserRole.STUDENT,
        botStartedAt: null, // Set when user starts the bot
      });
      
      user = await this.userRepository.save(user);
      this.logger.log(`Created new user: ${user.id} (Telegram: ${telegramUserId})`);
    } else {
      // Update existing user with latest Telegram data
      user.username = telegramUser.username || user.username;
      user.firstName = telegramUser.first_name || user.firstName;
      user.lastName = telegramUser.last_name || user.lastName;
      
      // Update admin status based on config (server-side only)
      if (isAdmin && user.role !== UserRole.ADMIN) {
        user.role = UserRole.ADMIN;
        this.logger.log(`Promoted user ${user.id} to admin`);
      } else if (!isAdmin && user.role === UserRole.ADMIN) {
        // Only demote if removed from admin list
        user.role = UserRole.STUDENT;
        this.logger.log(`Demoted user ${user.id} from admin`);
      }
      
      user = await this.userRepository.save(user);
    }

    // Generate JWT token
    const payload: JwtPayload = {
      sub: user.id,
      telegramUserId: user.telegramUserId,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        telegramUserId: user.telegramUserId,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        language: user.language,
        role: user.role,
        isAdmin: user.role === UserRole.ADMIN,
      },
    };
  }

  /**
   * Map Telegram language code to app language.
   */
  private mapLanguageCode(languageCode?: string): Language {
    if (!languageCode) {
      return Language.UZ_LAT;
    }

    switch (languageCode.toLowerCase()) {
      case 'ru':
        return Language.RU;
      case 'uz':
        return Language.UZ_LAT;
      default:
        return Language.UZ_LAT;
    }
  }

  /**
   * Verify and decode JWT token.
   */
  async verifyToken(token: string): Promise<JwtPayload | null> {
    try {
      return await this.jwtService.verifyAsync<JwtPayload>(token);
    } catch {
      return null;
    }
  }

  /**
   * Get user by ID.
   */
  async getUserById(userId: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id: userId } });
  }
}
