import { BadRequestException, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '../../src/auth/auth.guard';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let jwtService: JwtService;

  const mockRequest = {
    headers: {},
  };

  const mockContext = {
    switchToHttp: () => ({
      getRequest: () => mockRequest,
    }),
  } as unknown as ExecutionContext;

  beforeEach(() => {
    jwtService = new JwtService({ secret: 'test-secret' });
    guard = new AuthGuard(jwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should throw an error if the Authorization header is missing', () => {
    mockRequest.headers = {};

    expect(() => guard.canActivate(mockContext)).toThrow(
      new BadRequestException(
        "Required header 'authorization' not found in request",
      ),
    );
  });

  it('should throw an error if the token type is not Bearer', () => {
    mockRequest.headers = { authorization: 'Basic abcdef' };

    expect(() => guard.canActivate(mockContext)).toThrow(
      new BadRequestException('Invalid type of authorization token'),
    );
  });

  it('should throw an error if the token is not provided', () => {
    mockRequest.headers = { authorization: 'Bearer' };

    expect(() => guard.canActivate(mockContext)).toThrow(
      new BadRequestException('Token not found'),
    );
  });

  it('should throw an error if the token is invalid', () => {
    mockRequest.headers = { authorization: 'Bearer invalid.token' };

    jest.spyOn(jwtService, 'verify').mockImplementation(() => {
      throw new Error('Invalid token');
    });

    expect(() => guard.canActivate(mockContext)).toThrow(
      new BadRequestException('Invalid authorization token'),
    );
  });

  it('should return true and attach userId to headers for a valid token', () => {
    const token = 'valid-jwt-token';
    const decodedPayload = { id: 123, email: 'test@example.com' };
    mockRequest.headers = { authorization: `Bearer ${token}` };

    jest.spyOn(jwtService, 'verify').mockReturnValue(decodedPayload);

    const canActivate = guard.canActivate(mockContext);

    expect(canActivate).toBe(true);
    expect(mockRequest.headers['user-id']).toBe(decodedPayload.id.toString());
  });
});
