import { applyDecorators, UseGuards, SetMetadata } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AdminGuard } from '../guards/admin.guard';

/**
 * Decorator to mark a route as requiring authentication.
 * Applies JwtAuthGuard.
 */
export function Auth() {
  return applyDecorators(UseGuards(JwtAuthGuard));
}

/**
 * Decorator to mark a route as admin-only.
 * Applies both JwtAuthGuard and AdminGuard.
 */
export function AdminOnly() {
  return applyDecorators(
    SetMetadata('isAdmin', true),
    UseGuards(JwtAuthGuard, AdminGuard),
  );
}
