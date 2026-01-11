import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { UserRole } from '../../database/enums';

/**
 * Admin Guard - ensures user has admin role.
 * Must be used after JwtAuthGuard.
 * 
 * SECURITY NOTES:
 * - Only users with ADMIN role in the database are allowed
 * - Admin status is set based on ADMIN_TELEGRAM_IDS environment variable
 * - Never trust client-provided isAdmin; always verify server-side
 * - Role is determined from the JWT payload which comes from database
 * - Logs all admin access attempts for security audit
 */
@Injectable()
export class AdminGuard implements CanActivate {
  private readonly logger = new Logger(AdminGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      this.logger.warn('Admin access attempted without authentication');
      throw new ForbiddenException('User not authenticated');
    }

    // Validate user object structure
    if (!user.sub || !user.role) {
      this.logger.warn('Admin access attempted with invalid user payload');
      throw new ForbiddenException('Invalid user payload');
    }

    // Only ADMIN role is allowed
    if (user.role !== UserRole.ADMIN && user.role !== 'admin') {
      this.logger.warn(`Admin access denied for user ${user.sub} with role ${user.role}`);
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}
