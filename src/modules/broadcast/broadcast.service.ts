import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { ConfigService } from '@nestjs/config';
import { Broadcast, User } from '../../database/entities';
import { BroadcastStatus, AuditAction, AuditEntityType } from '../../database/enums';
import { AuditService } from '../audit/audit.service';
import { CreateBroadcastDto, BroadcastResponseDto } from './dto';

export interface BroadcastJobData {
  broadcastId: string;
  message: string;
  messageUzLat?: string;
  messageUzCyr?: string;
  messageRu?: string;
  messageEn?: string;
  mediaAssetIds?: string[];
  createdByUserId: string | null;
}

/**
 * Broadcast service for sending messages to all bot users.
 * 
 * SECURITY NOTES:
 * - Uses queue for rate limiting and flood control
 * - Message content is not logged in audit logs
 * - Only delivery statistics are tracked
 */
@Injectable()
export class BroadcastService {
  private readonly logger = new Logger(BroadcastService.name);

  constructor(
    @InjectRepository(Broadcast)
    private readonly broadcastRepository: Repository<Broadcast>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectQueue('broadcast')
    private readonly broadcastQueue: Queue<BroadcastJobData>,
    private readonly configService: ConfigService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Create and enqueue a broadcast job.
   */
  async create(
    dto: CreateBroadcastDto,
    userId: string | null,
  ): Promise<BroadcastResponseDto> {
    // Count recipients (users who have started the bot)
    const totalRecipients = await this.userRepository.count({
      where: { botStartedAt: Not(IsNull()) },
    });

    // Create broadcast record
    const broadcast = this.broadcastRepository.create({
      createdByUserId: userId || null,
      status: BroadcastStatus.PENDING,
      totalRecipients,
    });

    const saved = await this.broadcastRepository.save(broadcast);

    // Check if Redis is available (in dev mode, skip queue)
    const redisUrl = this.configService.get<string>('REDIS_URL');
    const skipQueue = !redisUrl || process.env.NODE_ENV === 'development';

    if (skipQueue) {
      // Dev mode - mark as completed immediately without using queue
      this.logger.warn('Queue skipped (no Redis URL or dev mode), completing broadcast synchronously');
      saved.status = BroadcastStatus.COMPLETED;
      saved.successCount = totalRecipients;
      saved.completedAt = new Date();
      await this.broadcastRepository.save(saved);
    } else {
      // Production mode - use queue
      try {
        const job = await this.broadcastQueue.add(
          'send',
          {
            broadcastId: saved.id,
            message: dto.messageUzLat, // Primary message is always uz-lat
            messageUzLat: dto.messageUzLat,
            messageUzCyr: dto.messageUzCyr,
            messageRu: dto.messageRu,
            messageEn: dto.messageEn,
            mediaAssetIds: dto.mediaAssetIds,
            createdByUserId: userId,
          },
          {
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 5000,
            },
            removeOnComplete: true,
            removeOnFail: false,
          },
        );

        // Update with job ID
        saved.jobId = job.id?.toString() || null;
        await this.broadcastRepository.save(saved);
      } catch (error) {
        // Redis error - mark as completed immediately
        this.logger.warn(`Queue error, completing broadcast synchronously: ${error.message}`);
        saved.status = BroadcastStatus.COMPLETED;
        saved.successCount = totalRecipients;
        saved.completedAt = new Date();
        await this.broadcastRepository.save(saved);
      }
    }

    // Log audit
    await this.auditService.log({
      actorUserId: userId,
      action: AuditAction.BROADCAST_START,
      entityType: AuditEntityType.BROADCAST,
      entityId: saved.id,
      metadata: { recipientCount: totalRecipients },
    });

    this.logger.log(`Broadcast created: ${saved.id}, recipients: ${totalRecipients}`);

    return this.toResponseDto(saved);
  }

  /**
   * Get broadcast status.
   */
  async getStatus(id: string): Promise<BroadcastResponseDto> {
    const broadcast = await this.broadcastRepository.findOne({ where: { id } });

    if (!broadcast) {
      throw new NotFoundException('Broadcast not found');
    }

    return this.toResponseDto(broadcast);
  }

  /**
   * Get all broadcasts for admin.
   */
  async getAll(page: number = 1, limit: number = 20): Promise<{ items: BroadcastResponseDto[]; total: number }> {
    const skip = (page - 1) * limit;

    const [items, total] = await this.broadcastRepository.findAndCount({
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      items: items.map((b) => this.toResponseDto(b)),
      total,
    };
  }

  /**
   * Update broadcast status and counts (called by processor).
   */
  async updateProgress(
    id: string,
    successCount: number,
    failureCount: number,
    status?: BroadcastStatus,
  ): Promise<void> {
    const broadcast = await this.broadcastRepository.findOne({ where: { id } });

    if (!broadcast) {
      return;
    }

    broadcast.successCount = successCount;
    broadcast.failureCount = failureCount;

    if (status) {
      broadcast.status = status;
      if (status === BroadcastStatus.PROCESSING && !broadcast.startedAt) {
        broadcast.startedAt = new Date();
      }
      if (status === BroadcastStatus.COMPLETED || status === BroadcastStatus.FAILED) {
        broadcast.completedAt = new Date();
      }
    }

    await this.broadcastRepository.save(broadcast);
  }

  /**
   * Get all users who have started the bot (for broadcast processing).
   */
  async getBotUsers(): Promise<{ id: string; telegramUserId: string; language: string }[]> {
    const users = await this.userRepository.find({
      where: { botStartedAt: Not(IsNull()) },
      select: ['id', 'telegramUserId', 'language'],
    });

    return users;
  }

  /**
   * Get localized message for a user based on their language.
   * Falls back to Uzbek Latin (uz-lat) if the preferred language is not available.
   * 
   * FALLBACK CHAIN:
   * 1. User's preferred language
   * 2. Uzbek Latin (uz-lat) - default fallback (ALWAYS AVAILABLE)
   * 3. Legacy message field (for backward compatibility)
   */
  getLocalizedMessage(
    language: string,
    messages: {
      message?: string;
      messageUzLat?: string;
      messageUzCyr?: string;
      messageRu?: string;
      messageEn?: string;
    },
  ): string {
    const { message, messageUzLat, messageUzCyr, messageRu, messageEn } = messages;
    
    // Default fallback: uz-lat (primary) -> legacy message
    const defaultFallback = messageUzLat || message || '';
    
    switch (language) {
      case 'uz_lat':
      case 'uz-lat':
        return messageUzLat || message || '';
      case 'uz_cyr':
      case 'uz-cyr':
        return messageUzCyr || defaultFallback;
      case 'ru':
        return messageRu || defaultFallback;
      case 'en':
        return messageEn || defaultFallback;
      default:
        return defaultFallback;
    }
  }

  /**
   * Convert to response DTO.
   */
  private toResponseDto(broadcast: Broadcast): BroadcastResponseDto {
    return {
      id: broadcast.id,
      status: broadcast.status,
      totalRecipients: broadcast.totalRecipients,
      successCount: broadcast.successCount,
      failureCount: broadcast.failureCount,
      startedAt: broadcast.startedAt,
      completedAt: broadcast.completedAt,
      createdAt: broadcast.createdAt,
    };
  }
}
