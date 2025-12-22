import { ContactStatus } from '../../../database/enums';

/**
 * Response DTO for contact.
 */
export class ContactResponseDto {
  id: string;
  fullName: string;
  telegramUserId: string | null;
  position: string | null;
  department: string | null;
  description: string | null;
  status: ContactStatus;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Public response DTO for contact (students view).
 * Excludes internal fields.
 */
export class PublicContactResponseDto {
  id: string;
  fullName: string;
  position: string | null;
  department: string | null;
  description: string | null;
}
