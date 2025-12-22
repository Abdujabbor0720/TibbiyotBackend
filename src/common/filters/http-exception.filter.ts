import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Global HTTP exception filter.
 * Provides consistent error response format and secure error handling.
 * 
 * SECURITY NOTES:
 * - Never expose internal error details in production
 * - Always log errors for debugging but sanitize sensitive data
 * - Use consistent error format for all responses
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isProduction = process.env.NODE_ENV === 'production';
    const timestamp = new Date().toISOString();
    const path = request.url;

    let status: number;
    let message: string;
    let error: string;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as Record<string, unknown>;
        message = (responseObj.message as string) || exception.message;
        error = (responseObj.error as string) || 'Error';
      } else {
        message = exceptionResponse as string;
        error = 'Error';
      }
    } else if (exception instanceof Error) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      error = 'Internal Server Error';
      message = isProduction ? 'An unexpected error occurred' : exception.message;
      
      // Log internal errors
      this.logger.error(
        `Internal error: ${exception.message}`,
        exception.stack,
      );
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      error = 'Internal Server Error';
      message = 'An unexpected error occurred';
    }

    const errorResponse: Record<string, unknown> = {
      statusCode: status,
      error,
      message,
      timestamp,
      path,
    };

    // Add stack trace in development only
    if (!isProduction && exception instanceof Error) {
      errorResponse.stack = exception.stack;
    }

    // Log request details for debugging (without sensitive data)
    this.logger.warn(
      `[${request.method}] ${path} - ${status} - ${message}`,
      {
        ip: request.ip,
        userAgent: request.headers['user-agent'],
        userId: request['user']?.id,
      },
    );

    response.status(status).json(errorResponse);
  }
}
