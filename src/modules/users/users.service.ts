import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import { User } from '../../database/entities';
import { UserRole } from '../../database/enums';
import { UpdateUserDto, UserResponseDto } from './dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Get user by ID.
   */
  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  /**
   * Get user by Telegram user ID.
   */
  async findByTelegramUserId(telegramUserId: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { telegramUserId } });
  }

  /**
   * Get user profile by ID.
   * Returns sanitized user data without sensitive fields.
   */
  async getProfile(userId: string): Promise<UserResponseDto> {
    const user = await this.findById(userId);
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.toResponseDto(user);
  }

  /**
   * Update user profile.
   * Only allows updating specific fields.
   */
  async updateProfile(userId: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.findById(userId);
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update only allowed fields
    if (dto.firstName !== undefined) {
      user.firstName = dto.firstName;
    }
    if (dto.lastName !== undefined) {
      user.lastName = dto.lastName;
    }
    if (dto.language !== undefined) {
      user.language = dto.language;
    }
    if (dto.course !== undefined) {
      user.course = dto.course;
    }
    if (dto.major !== undefined) {
      user.major = dto.major;
    }
    if (dto.age !== undefined) {
      user.age = dto.age;
    }

    const updatedUser = await this.userRepository.save(user);
    return this.toResponseDto(updatedUser);
  }

  /**
   * Mark user as having started the bot.
   */
  async markBotStarted(telegramUserId: string): Promise<void> {
    const user = await this.findByTelegramUserId(telegramUserId);
    
    if (user && !user.botStartedAt) {
      user.botStartedAt = new Date();
      await this.userRepository.save(user);
    }
  }

  /**
   * Get all users who have started the bot.
   * Used for broadcast.
   */
  async getAllBotUsers(): Promise<User[]> {
    return this.userRepository.find({
      where: {
        botStartedAt: Not(IsNull()),
      },
      select: ['id', 'telegramUserId'],
    });
  }

  /**
   * Get count of users who have started the bot.
   */
  async getBotUsersCount(): Promise<number> {
    return this.userRepository.count({
      where: {
        botStartedAt: Not(IsNull()),
      },
    });
  }

  /**
   * Create or update user from bot interaction.
   */
  async createOrUpdateFromBot(
    telegramUserId: string,
    data: Partial<User>,
  ): Promise<User> {
    let user = await this.findByTelegramUserId(telegramUserId);

    if (!user) {
      user = this.userRepository.create({
        telegramUserId,
        ...data,
        botStartedAt: new Date(),
      });
    } else {
      // Update existing user
      Object.assign(user, data);
      if (!user.botStartedAt) {
        user.botStartedAt = new Date();
      }
    }

    return this.userRepository.save(user);
  }

  /**
   * Convert User entity to response DTO.
   */
  private toResponseDto(user: User): UserResponseDto {
    return {
      id: user.id,
      telegramUserId: user.telegramUserId,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      language: user.language,
      course: user.course,
      major: user.major,
      age: user.age,
      role: user.role,
      isAdmin: user.role === UserRole.ADMIN,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
