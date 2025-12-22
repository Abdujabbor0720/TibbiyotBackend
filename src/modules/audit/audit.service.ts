import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../../database/entities';
import { AuditAction, AuditEntityType } from '../../database/enums';

export interface AuditLogData {
  actorUserId: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Audit service for logging admin actions.
 * 
 * SECURITY NOTES:
 * - Never log sensitive content (message text, passwords)
 * - Log metadata only (IDs, action types, timestamps)
 * - Used for compliance and security monitoring
 */
@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepository: Repository<AuditLog>,
  ) {}

  /**
   * Log an admin action.
   */
  async log(data: AuditLogData): Promise<AuditLog> {
    const auditLog = this.auditRepository.create({
      actorUserId: data.actorUserId,
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId || null,
      metadata: data.metadata || null,
      ipAddress: data.ipAddress || null,
      userAgent: data.userAgent || null,
    });

    const saved = await this.auditRepository.save(auditLog);
    
    this.logger.log(
      `Audit: ${data.action} on ${data.entityType}${data.entityId ? `:${data.entityId}` : ''} by user ${data.actorUserId}`,
    );

    return saved;
  }

  /**
   * Log news creation.
   */
  async logNewsCreate(
    actorUserId: string,
    newsId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuditLog> {
    return this.log({
      actorUserId,
      action: AuditAction.NEWS_CREATE,
      entityType: AuditEntityType.NEWS,
      entityId: newsId,
      ipAddress,
      userAgent,
    });
  }

  /**
   * Log news update.
   */
  async logNewsUpdate(
    actorUserId: string,
    newsId: string,
    changes?: Record<string, unknown>,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuditLog> {
    return this.log({
      actorUserId,
      action: AuditAction.NEWS_UPDATE,
      entityType: AuditEntityType.NEWS,
      entityId: newsId,
      metadata: changes ? { changedFields: Object.keys(changes) } : undefined,
      ipAddress,
      userAgent,
    });
  }

  /**
   * Log news deletion.
   */
  async logNewsDelete(
    actorUserId: string,
    newsId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuditLog> {
    return this.log({
      actorUserId,
      action: AuditAction.NEWS_DELETE,
      entityType: AuditEntityType.NEWS,
      entityId: newsId,
      ipAddress,
      userAgent,
    });
  }

  /**
   * Log contact creation.
   */
  async logContactCreate(
    actorUserId: string,
    contactId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuditLog> {
    return this.log({
      actorUserId,
      action: AuditAction.CONTACT_CREATE,
      entityType: AuditEntityType.CONTACT,
      entityId: contactId,
      ipAddress,
      userAgent,
    });
  }

  /**
   * Log contact update.
   */
  async logContactUpdate(
    actorUserId: string,
    contactId: string,
    changes?: Record<string, unknown>,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuditLog> {
    return this.log({
      actorUserId,
      action: AuditAction.CONTACT_UPDATE,
      entityType: AuditEntityType.CONTACT,
      entityId: contactId,
      metadata: changes ? { changedFields: Object.keys(changes) } : undefined,
      ipAddress,
      userAgent,
    });
  }

  /**
   * Log contact deletion.
   */
  async logContactDelete(
    actorUserId: string,
    contactId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuditLog> {
    return this.log({
      actorUserId,
      action: AuditAction.CONTACT_DELETE,
      entityType: AuditEntityType.CONTACT,
      entityId: contactId,
      ipAddress,
      userAgent,
    });
  }

  /**
   * Log broadcast start.
   */
  async logBroadcastStart(
    actorUserId: string,
    broadcastId: string,
    recipientCount: number,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuditLog> {
    return this.log({
      actorUserId,
      action: AuditAction.BROADCAST_START,
      entityType: AuditEntityType.BROADCAST,
      entityId: broadcastId,
      metadata: { recipientCount },
      ipAddress,
      userAgent,
    });
  }

  /**
   * Log broadcast completion.
   */
  async logBroadcastComplete(
    actorUserId: string,
    broadcastId: string,
    successCount: number,
    failureCount: number,
  ): Promise<AuditLog> {
    return this.log({
      actorUserId,
      action: AuditAction.BROADCAST_COMPLETE,
      entityType: AuditEntityType.BROADCAST,
      entityId: broadcastId,
      metadata: { successCount, failureCount },
    });
  }

  /**
   * Log media upload.
   */
  async logMediaUpload(
    actorUserId: string,
    mediaId: string,
    metadata?: Record<string, unknown>,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuditLog> {
    return this.log({
      actorUserId,
      action: AuditAction.MEDIA_UPLOAD,
      entityType: AuditEntityType.MEDIA,
      entityId: mediaId,
      metadata,
      ipAddress,
      userAgent,
    });
  }

  /**
   * Get audit logs with pagination.
   */
  async getAuditLogs(
    page: number = 1,
    limit: number = 50,
    filters?: {
      actorUserId?: string;
      action?: AuditAction;
      entityType?: AuditEntityType;
    },
  ): Promise<{ items: AuditLog[]; total: number }> {
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};

    if (filters?.actorUserId) {
      where.actorUserId = filters.actorUserId;
    }
    if (filters?.action) {
      where.action = filters.action;
    }
    if (filters?.entityType) {
      where.entityType = filters.entityType;
    }

    const [items, total] = await this.auditRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
      relations: ['actor'],
    });

    return { items, total };
  }
}
