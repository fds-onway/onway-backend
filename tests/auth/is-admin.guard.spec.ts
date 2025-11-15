import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '../../src/auth/auth.guard';
import { IsAdminGuard } from '../../src/auth/is-admin.guard';

describe('IsAdminGuard', () => {
  let guard: IsAdminGuard;
  let authGuard: AuthGuard;
  let jwtService: JwtService;

  const mockRequest = {
    headers: {
      authorization: 'Bearer valid-token',
    },
  };

  const mockContext = {
    switchToHttp: () => ({
      getRequest: () => mockRequest,
    }),
  } as unknown as ExecutionContext;

  beforeEach(() => {
    jwtService = new JwtService({ secret: 'test-secret' });
    authGuard = new AuthGuard(jwtService);
    guard = new IsAdminGuard(authGuard, jwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call authGuard.canActivate', () => {
    const authGuardSpy = jest
      .spyOn(authGuard, 'canActivate')
      .mockReturnValue(true);
    jest
      .spyOn(jwtService, 'verify')
      .mockReturnValue({ id: 1, email: 'admin@example.com', role: 'admin' });

    guard.canActivate(mockContext);

    expect(authGuardSpy).toHaveBeenCalledWith(mockContext);
  });

  it('should return true for a user with the admin role', () => {
    jest.spyOn(authGuard, 'canActivate').mockReturnValue(true);
    jest
      .spyOn(jwtService, 'verify')
      .mockReturnValue({ id: 1, email: 'admin@example.com', role: 'admin' });

    const canActivate = guard.canActivate(mockContext);

    expect(canActivate).toBe(true);
  });

  it('should throw ForbiddenException for a user without the admin role', () => {
    jest.spyOn(authGuard, 'canActivate').mockReturnValue(true);
    jest
      .spyOn(jwtService, 'verify')
      .mockReturnValue({ id: 2, email: 'user@example.com', role: 'user' });

    expect(() => guard.canActivate(mockContext)).toThrow(
      new ForbiddenException('User is not admin.'),
    );
  });
});
