/**
 * Supported languages for the application.
 * uz_lat: Uzbek (Latin script)
 * uz_cyr: Uzbek (Cyrillic script)
 * ru: Russian
 * en: English
 */
export enum Language {
  UZ_LAT = 'uz_lat',
  UZ_CYR = 'uz_cyr',
  RU = 'ru',
  EN = 'en',
}

/**
 * User roles in the system.
 * Only one ADMIN is allowed, defined in .env as ADMIN_TELEGRAM_ID
 */
export enum UserRole {
  STUDENT = 'student',
  CONTACT_PERSON = 'contact_person',
  ADMIN = 'admin',
}

/**
 * Types of media assets supported.
 */
export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
}

/**
 * Owner types for media assets (polymorphic association).
 */
export enum MediaOwnerType {
  NEWS = 'news',
  MESSAGE = 'message',
}

/**
 * Sender types for messages.
 */
export enum SenderType {
  STUDENT = 'student',
  CONTACT = 'contact',
}

/**
 * Contact reachability status.
 */
export enum ContactStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  UNREACHABLE = 'unreachable',
}

/**
 * Audit log action types.
 */
export enum AuditAction {
  // News actions
  NEWS_CREATE = 'news.create',
  NEWS_UPDATE = 'news.update',
  NEWS_DELETE = 'news.delete',
  
  // Contact actions
  CONTACT_CREATE = 'contact.create',
  CONTACT_UPDATE = 'contact.update',
  CONTACT_DELETE = 'contact.delete',
  
  // Broadcast actions
  BROADCAST_START = 'broadcast.start',
  BROADCAST_COMPLETE = 'broadcast.complete',
  
  // Media actions
  MEDIA_UPLOAD = 'media.upload',
  MEDIA_DELETE = 'media.delete',
  
  // User actions
  USER_ROLE_CHANGE = 'user.role_change',
}

/**
 * Entity types for audit logs.
 */
export enum AuditEntityType {
  NEWS = 'news',
  CONTACT = 'contact',
  BROADCAST = 'broadcast',
  MEDIA = 'media',
  USER = 'user',
}

/**
 * Broadcast job status.
 */
export enum BroadcastStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}
