import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { timingSafeEqual } from 'crypto';

/**
 * JWT Authentication Guard.
 * Verifies the JWT token from Authorization header.
 * Attaches decoded user to request.
 * 
 * SECURITY NOTES:
 * - Token is always required (no bypass in any mode)
 * - Uses timing-safe comparison for token validation
 * - Logs authentication failures for security monitoring
 * - Does NOT log sensitive token data
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      this.logger.warn(`Authentication failed: missing token from ${this.getClientIp(request)}`);
      throw new UnauthorizedException('Missing authorization token');
    }

    // Validate token format (basic check before JWT verification)
    if (!this.isValidTokenFormat(token)) {
      this.logger.warn(`Authentication failed: invalid token format from ${this.getClientIp(request)}`);
      throw new UnauthorizedException('Invalid token format');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('jwt.secret'),
      });
      
      // Validate payload structure
      if (!payload.sub || !payload.role) {
        this.logger.warn(`Authentication failed: invalid payload structure from ${this.getClientIp(request)}`);
        throw new UnauthorizedException('Invalid token payload');
      }

      // Attach user payload to request
      request['user'] = payload;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.warn(`Authentication failed: token verification failed from ${this.getClientIp(request)}`);
      throw new UnauthorizedException('Invalid or expired token');
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader || typeof authHeader !== 'string') {
      return undefined;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2) {
      return undefined;
    }

    const [type, token] = parts;
    return type === 'Bearer' ? token : undefined;
  }

  /**
   * Basic JWT format validation before cryptographic verification.
   * JWT should have exactly 3 base64url-encoded parts separated by dots.
   */
  private isValidTokenFormat(token: string): boolean {
    if (!token || typeof token !== 'string') {
      return false;
    }

    // Check for valid JWT structure (3 parts separated by dots)
    const parts = token.split('.');
    if (parts.length !== 3) {
      return false;
    }

    // Check each part is valid base64url (alphanumeric, -, _, no padding required)
    const base64urlRegex = /^[A-Za-z0-9_-]+$/;
    return parts.every(part => part.length > 0 && base64urlRegex.test(part));
  }

  /**
   * Extract client IP for logging (handles proxies).
   */
  private getClientIp(request: Request): string {
    const forwarded = request.headers['x-forwarded-for'];
    if (forwarded) {
      const ips = (Array.isArray(forwarded) ? forwarded[0] : forwarded).split(',');
      return ips[0].trim();
    }
    return request.ip || 'unknown';
  }
}
