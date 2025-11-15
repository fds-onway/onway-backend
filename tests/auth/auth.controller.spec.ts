import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import 'src/types/express';
import { AuthController } from '../../src/auth/auth.controller';
import {
  ForgotPasswordDTO,
  GoogleTokenDto,
  LoginDTO,
  ResetPasswordDTO,
} from '../../src/auth/auth.dto';
import {
  InvalidTokenError,
  InvalidUserException,
} from '../../src/auth/auth.exceptions';
import { AuthService } from '../../src/auth/auth.service';
import { UserService } from '../../src/user/user.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let userService: UserService;
  let mockAuthService: ReturnType<typeof createMockAuthService>;
  let mockUserService: ReturnType<typeof createMockUserService>;

  const createMockAuthService = () => ({
    googleLogin: jest.fn(),
    login: jest.fn(),
    verifyGoogleTokenAndSignIn: jest.fn(),
    confirmEmailVerification: jest.fn(),
    sendPasswordResetEmail: jest.fn(),
    resetPassword: jest.fn(),
  });

  const createMockUserService = () => ({
    getUserById: jest.fn(),
  });

  const mockRequest: Partial<Request> = {
    user: {
      name: 'John',
      id: 1,
      email: 'john@example.com',
      passwordHash: 'hash',
      salt: 'salt',
      providerEnum: 'local',
      googleId: null,
      role: 'user',
      createAt: Date.now(),
    },
  };

  beforeEach(async () => {
    mockAuthService = createMockAuthService();
    mockUserService = createMockUserService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: UserService, useValue: mockUserService },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(() => 'test-token'),
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('userAuth', () => {
    it('should return a valid token if login is successful', async () => {
      const dto: LoginDTO = { email: 'test@test.com', password: '123456' };
      mockAuthService.login.mockResolvedValue('token');

      const result = await controller.userAuth(dto);

      expect(authService.login).toHaveBeenCalledWith(dto);
      expect(result).toBe('token');
    });

    it('should throw UnauthorizedException when login fails', async () => {
      const dto: LoginDTO = { email: 'test@test.com', password: 'wrong' };
      mockAuthService.login.mockRejectedValue(new Error('fail'));

      await expect(controller.userAuth(dto)).rejects.toThrow(
        new UnauthorizedException('Usuário ou senha incorretos'),
      );
    });

    it('should throw UnauthorizedException for unverified user', async () => {
      const dto: LoginDTO = { email: 'test@test.com', password: 'password' };
      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException(
          'Por favor, verifique seu e-mail antes de fazer login.',
        ),
      );

      await expect(controller.userAuth(dto)).rejects.toThrow(
        new UnauthorizedException('Usuário ou senha incorretos'),
      );
    });
  });

  describe('googleTokenSignIn', () => {
    it('should verify token and return login response', async () => {
      const dto: GoogleTokenDto = { idToken: 'valid_token' };
      mockAuthService.verifyGoogleTokenAndSignIn.mockResolvedValue(
        mockRequest.user,
      );
      mockAuthService.googleLogin.mockReturnValue('token');

      const result = await controller.googleTokenSignIn(dto);

      expect(authService.verifyGoogleTokenAndSignIn).toHaveBeenCalledWith(
        'valid_token',
      );
      expect(authService.googleLogin).toHaveBeenCalledWith(mockRequest.user);
      expect(result).toBe('token');
    });
  });

  describe('googleAuthRedirect', () => {
    it('should throw ConflictException when email already exists with local provider', () => {
      const conflictMessage =
        'Usuário com esse e-mail já existe, por favor faça login com sua senha.';

      mockAuthService.googleLogin.mockImplementation(() => {
        throw new ConflictException(conflictMessage);
      });

      try {
        controller.googleAuthRedirect(mockRequest as Request);
        fail('Deveria ter lançado ConflictException');
      } catch (error) {
        expect(error).toBeInstanceOf(ConflictException);
        expect((error as ConflictException).message).toBe(conflictMessage);
      }
    });
  });

  describe('verifyEmail', () => {
    it('should call confirmEmailVerification with the token', async () => {
      const token = 'verification-token';
      await controller.verifyEmail(token);
      expect(authService.confirmEmailVerification).toHaveBeenCalledWith(token);
    });
  });

  describe('getMe', () => {
    it('should return user data for a valid user ID', async () => {
      const user = { id: 1, name: 'John Doe', email: 'john@example.com' };
      mockUserService.getUserById.mockResolvedValue(user);

      const result = await controller.getMe(1);

      expect(userService.getUserById).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        id: user.id,
        name: user.name,
        email: user.email,
      });
    });

    it('should throw NotFoundException for an invalid user ID', async () => {
      mockUserService.getUserById.mockResolvedValue(null);

      await expect(controller.getMe(999)).rejects.toThrow(
        new NotFoundException('Usuário não encontrado'),
      );
    });
  });

  describe('forgotPassword', () => {
    it('should call sendPasswordResetEmail and return a message', async () => {
      const dto: ForgotPasswordDTO = { email: 'test@example.com' };
      await controller.forgotPassword(dto);

      expect(authService.sendPasswordResetEmail).toHaveBeenCalledWith(
        dto.email,
      );
    });
  });

  describe('resetPassword', () => {
    it('should call resetPassword and return a success message', async () => {
      const dto: ResetPasswordDTO = {
        token: 'reset-token',
        password: 'newPassword123',
      };
      mockAuthService.resetPassword.mockResolvedValue(undefined);

      const result = await controller.resetPassword(dto);

      expect(authService.resetPassword).toHaveBeenCalledWith(
        dto.token,
        dto.password,
      );
      expect(result).toEqual({ message: 'Senha redefinida com sucesso.' });
    });

    it('should throw UnauthorizedException for an invalid token', async () => {
      const dto: ResetPasswordDTO = {
        token: 'invalid-token',
        password: 'newPassword123',
      };
      mockAuthService.resetPassword.mockRejectedValue(new InvalidTokenError());

      await expect(controller.resetPassword(dto)).rejects.toThrow(
        new UnauthorizedException('Token inválido ou expirado'),
      );
    });

    it('should throw UnauthorizedException for an invalid user', async () => {
      const dto: ResetPasswordDTO = {
        token: 'valid-token',
        password: 'newPassword123',
      };
      mockAuthService.resetPassword.mockRejectedValue(
        new InvalidUserException(),
      );

      await expect(controller.resetPassword(dto)).rejects.toThrow(
        new UnauthorizedException('Usuário não encontrado ou inválido'),
      );
    });
  });
});
