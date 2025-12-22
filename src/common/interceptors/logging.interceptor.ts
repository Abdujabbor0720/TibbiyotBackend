import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Logging interceptor for request/response tracking.
 * 
 * SECURITY NOTES:
 * - Never log sensitive data like passwords, tokens, or message contents
 * - Log metadata only for security auditing
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const { method, url, ip } = request;
    const userAgent = request.headers['user-agent'] || 'unknown';
    const userId = request.user?.id || 'anonymous';

    const now = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse();
          const { statusCode } = response;
          const responseTime = Date.now() - now;

          this.logger.log(
            `[${method}] ${url} - ${statusCode} - ${responseTime}ms - ${userId} - ${ip} - ${userAgent}`,
          );
        },
        error: (error) => {
          const responseTime = Date.now() - now;
          const statusCode = error.status || 500;

          this.logger.warn(
            `[${method}] ${url} - ${statusCode} - ${responseTime}ms - ${userId} - ${ip} - ${userAgent}`,
          );
        },
      }),
    );
  }
}
