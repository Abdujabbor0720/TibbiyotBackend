import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Contact, NewsPost, Broadcast, AuditLog } from '../../database/entities';

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
  ) {}

  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    const [totalUsers, totalContacts, totalNews, totalBroadcasts] = await Promise.all([
      this.userRepository.count(),
      this.contactRepository.count(),
      this.newsRepository.count(),
      this.broadcastRepository.count(),
    ]);

    return {
      totalUsers,
      totalContacts,
      totalNews,
      totalBroadcasts,
    };
  }

  /**
   * Get activity logs (audit logs)
   */
  async getActivityLogs(limit: number, offset: number) {
    const [logs, total] = await this.auditLogRepository.findAndCount({
      relations: ['actor'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

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
