import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { UserRole } from '../../database/enums';

/**
 * Admin Guard - ensures user has admin role.
 * Must be used after JwtAuthGuard.
 * 
 * SECURITY NOTES:
 * - Only one admin is allowed in the system (defined in .env as ADMIN_TELEGRAM_ID)
 * - Never trust client-provided isAdmin; always verify server-side
 * - Role is determined from the JWT payload which is set during authentication
 * - The JWT payload's role comes from the database, not from client
 */
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Only ADMIN role is allowed (single admin system)
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}
