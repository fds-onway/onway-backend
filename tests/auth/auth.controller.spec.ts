import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import 'src/types/express';
import { AuthController } from '../../src/auth/auth.controller';
import { GoogleTokenDto, LoginDTO } from '../../src/auth/auth.dto';
import { AuthService } from '../../src/auth/auth.service';
describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let mockAuthService: ReturnType<typeof createMockAuthService>;

  const createMockAuthService = () => ({
    googleLogin: jest.fn(),
    login: jest.fn(),
    verifyGoogleTokenAndSignIn: jest.fn(),
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

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
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

      // Configura o mock para lançar a exceção esperada
      mockAuthService.googleLogin.mockImplementation(() => {
        throw new ConflictException(conflictMessage);
      });

      try {
        controller.googleAuthRedirect(mockRequest as Request);

        // Se chegou aqui, é porque NÃO lançou exceção — falha o teste explicitamente
        fail('Deveria ter lançado ConflictException');
      } catch (error) {
        expect(error).toBeInstanceOf(ConflictException);
        expect((error as ConflictException).message).toBe(conflictMessage);
      }
    });
  });
});
