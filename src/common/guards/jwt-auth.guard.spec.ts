import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let jwtService: JwtService;
  let configService: ConfigService;

  const mockJwtService = {
    verifyAsync: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('test-secret'),
  };

  beforeEach(() => {
    jwtService = mockJwtService as unknown as JwtService;
    configService = mockConfigService as unknown as ConfigService;
    guard = new JwtAuthGuard(jwtService, configService);
    jest.clearAllMocks();
  });

  const createMockContext = (authHeader?: string): ExecutionContext => {
    const request = {
      headers: authHeader ? { authorization: authHeader } : {},
    };

    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
    } as unknown as ExecutionContext;
  };

  describe('canActivate', () => {
    it('should validate JWT token and attach user to request', async () => {
      const mockUser = { sub: 'user-123', telegramId: 123456789 };
      mockJwtService.verifyAsync.mockResolvedValue(mockUser);

      const context = createMockContext('Bearer valid.jwt.token');
      const request = context.switchToHttp().getRequest();

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith('valid.jwt.token', {
        secret: 'test-secret',
      });
      expect(request['user']).toEqual(mockUser);
    });

    it('should throw UnauthorizedException when no token provided', async () => {
      const context = createMockContext();

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for invalid Bearer format', async () => {
      const context = createMockContext('InvalidFormat token');

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for invalid JWT', async () => {
      mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));
      const context = createMockContext('Bearer invalid.token');

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for expired JWT', async () => {
      mockJwtService.verifyAsync.mockRejectedValue(
        new Error('jwt expired'),
      );
      const context = createMockContext('Bearer expired.token');

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should handle empty authorization header', async () => {
      const context = createMockContext('');

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should handle "Bearer " with no token', async () => {
      const context = createMockContext('Bearer ');

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
