import { Language, UserRole } from '../../../database/enums';

/**
 * Response DTO for user profile.
 * Excludes sensitive fields.
 */
export class UserResponseDto {
  id: string;
  telegramUserId: string;
  username: string | null;
  firstName: string;
  lastName: string;
  language: Language;
  course: number | null;
  major: string | null;
  age: number | null;
  role: UserRole;
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
}
