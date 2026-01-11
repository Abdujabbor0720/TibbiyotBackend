import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { User, Contact, NewsPost, Broadcast, AuditLog, Message } from '../../database/entities';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
    @InjectRepository(NewsPost)
    private readonly newsRepository: Repository<NewsPost>,
    @InjectRepository(Broadcast)
    private readonly broadcastRepository: Repository<Broadcast>,
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    // Get today's start for messages count
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [totalUsers, totalContacts, totalNews, totalBroadcasts, totalMessages, messagesToday] = await Promise.all([
      this.userRepository.count(),
      this.contactRepository.count(),
      this.newsRepository.count(),
      this.broadcastRepository.count(),
      this.messageRepository.count(),
      this.messageRepository.count({
        where: {
          createdAt: MoreThanOrEqual(todayStart),
        },
      }),
    ]);

    // Calculate successful broadcasts (sum of successCount)
    const broadcastStats = await this.broadcastRepository
      .createQueryBuilder('broadcast')
      .select('SUM(broadcast.successCount)', 'totalSuccess')
      .addSelect('SUM(broadcast.failureCount)', 'totalFailure')
      .getRawOne();

    return {
      totalUsers,
      totalContacts,
      totalNews,
      totalBroadcasts,
      totalMessages,
      messagesToday,
      broadcastSuccess: parseInt(broadcastStats?.totalSuccess || '0'),
      broadcastFailure: parseInt(broadcastStats?.totalFailure || '0'),
    };
  }

  /**
   * Get activity logs (audit logs)
   */
  async getActivityLogs(limit: number, offset: number) {
    const [logs, total] = await this.auditLogRepository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.actor', 'actor')
      .orderBy('log.createdAt', 'DESC')
      .take(limit)
      .skip(offset)
      .getManyAndCount();

    return {
      data: logs.map(log => ({
        id: log.id,
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId,
        details: log.metadata,
        createdAt: log.createdAt,
        user: log.actor ? {
          id: log.actor.id,
          firstName: log.actor.firstName,
          lastName: log.actor.lastName,
        } : null,
      })),
      total,
      limit,
      offset,
    };
  }
}
