import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { AdminGuard } from './admin.guard';
import { UserRole } from '../../database/enums';

describe('AdminGuard', () => {
  let guard: AdminGuard;

  beforeEach(() => {
    guard = new AdminGuard();
    jest.clearAllMocks();
  });

  const createMockContext = (user?: { role: UserRole }): ExecutionContext => {
    const request = {
      user,
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
    it('should allow access for admin', () => {
      const context = createMockContext({ role: UserRole.ADMIN });

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should deny access for student', () => {
      const context = createMockContext({ role: UserRole.STUDENT });

      expect(() => guard.canActivate(context)).toThrow(
        ForbiddenException,
      );
    });

    it('should deny access for contact_person', () => {
      const context = createMockContext({ role: UserRole.CONTACT_PERSON });

      expect(() => guard.canActivate(context)).toThrow(
        ForbiddenException,
      );
    });

    it('should throw ForbiddenException when no user in request', () => {
      const context = createMockContext();

      expect(() => guard.canActivate(context)).toThrow(
        ForbiddenException,
      );
    });

    it('should throw ForbiddenException when user is undefined', () => {
      const context = createMockContext(undefined);

      expect(() => guard.canActivate(context)).toThrow(
        ForbiddenException,
      );
    });
  });
});
