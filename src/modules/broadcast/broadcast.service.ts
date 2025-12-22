import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { ConfigService } from '@nestjs/config';
import { Broadcast, User } from '../../database/entities';
import { BroadcastStatus } from '../../database/enums';
import { CreateBroadcastDto, BroadcastResponseDto } from './dto';

export interface BroadcastJobData {
  broadcastId: string;
  message: string;
  mediaAssetIds?: string[];
  createdByUserId: string;
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
  ) {}

  /**
   * Create and enqueue a broadcast job.
   */
  async create(
    dto: CreateBroadcastDto,
    userId: string,
  ): Promise<BroadcastResponseDto> {
    // Count recipients (users who have started the bot)
    const totalRecipients = await this.userRepository.count({
      where: { botStartedAt: Not(IsNull()) },
    });

    // Create broadcast record
    const broadcast = this.broadcastRepository.create({
      createdByUserId: userId,
      status: BroadcastStatus.PENDING,
      totalRecipients,
    });

    const saved = await this.broadcastRepository.save(broadcast);

    // Add job to queue
    const job = await this.broadcastQueue.add(
      'send',
      {
        broadcastId: saved.id,
        message: dto.message,
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
  async getBotUsers(): Promise<{ id: string; telegramUserId: string }[]> {
    const users = await this.userRepository.find({
      where: { botStartedAt: Not(IsNull()) },
      select: ['id', 'telegramUserId'],
    });

    return users;
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
