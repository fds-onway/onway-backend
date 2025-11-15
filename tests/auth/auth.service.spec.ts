import {
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as admin from 'firebase-admin';
import { User } from 'src/drizzle/schema';
import { EmailService } from 'src/email/email.service';
import { UserRepository } from 'src/user/user.repository';
import { UserService } from 'src/user/user.service';
import { AuthService } from '../../src/auth/auth.service';
import {
  InvalidTokenError,
  InvalidUserException,
} from '../../src/auth/auth.exceptions';
import { createHash } from 'crypto';

jest.mock('firebase-admin', () => ({
  auth: jest.fn().mockReturnValue({
    verifyIdToken: jest.fn(),
  }),
}));

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let userRepository: UserRepository;
  let jwtService: JwtService;
  let emailService: EmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            createFromGoogle: jest.fn(),
          },
        },
        {
          provide: UserRepository,
          useValue: {
            findByEmail: jest.fn(),
            findByToken: jest.fn(),
            verifyUser: jest.fn(),
            findById: jest.fn(),
            updateUser: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: EmailService,
          useValue: {
            sendPasswordResetEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    userRepository = module.get<UserRepository>(UserRepository);
    jwtService = module.get<JwtService>(JwtService);
    emailService = module.get<EmailService>(EmailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateGoogleUser', () => {
    it('should return user if found and provider is google', async () => {
      const user = { provider: 'google' };
      jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(user as User);
      const result = await service.validateGoogleUser({
        email: 'test@test.com',
        name: 'Test',
        googleId: '123',
      });
      expect(result).toEqual(user);
    });

    it('should throw ConflictException if user found and provider is local', async () => {
      const user = { provider: 'local' };
      jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(user as User);
      await expect(
        service.validateGoogleUser({
          email: 'test@test.com',
          name: 'Test',
          googleId: '123',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should create a new user if not found', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(null as any);
      jest.spyOn(userService, 'createFromGoogle').mockResolvedValue({} as User);
      await service.validateGoogleUser({
        email: 'test@test.com',
        name: 'Test',
        googleId: '123',
      });
      expect(userService.createFromGoogle).toHaveBeenCalled();
    });
  });

  describe('googleLogin', () => {
    it('should return an access token and expiration date', () => {
      const user = { id: 1, email: 'test@test.com', role: 'user' };
      jest.spyOn(jwtService, 'sign').mockReturnValue('token');
      const result = service.googleLogin(user as User);
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('expirationDate');
    });
  });

  describe('login', () => {
    it('should return an access token for valid credentials', async () => {
      const password = 'password';
      const salt = 'salt';
      const hash = createHash('sha256')
        .update(salt + password)
        .digest('hex');

      const user = {
        id: 1,
        email: 'test@test.com',
        role: 'user',
        provider: 'local',
        isVerified: true,
        salt,
        passwordHash: hash,
      };
      jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(user as User);
      jest.spyOn(jwtService, 'sign').mockReturnValue('token');
      const result = await service.login({
        email: 'test@test.com',
        password,
      });
      expect(result).toHaveProperty('accessToken');
    });

    it('should throw UnauthorizedException for unverified user', async () => {
      const user = { provider: 'local', isVerified: false };
      jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(user as User);
      await expect(
        service.login({ email: 'test@test.com', password: 'password' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw an error for invalid password', async () => {
      const user = {
        provider: 'local',
        isVerified: true,
        salt: 'salt',
        passwordHash: 'wronghash',
      };
      jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(user as User);
      await expect(
        service.login({ email: 'test@test.com', password: 'password' }),
      ).rejects.toThrow('Usuário ou senha incorretos');
    });
  });

  describe('verifyGoogleTokenAndSignIn', () => {
    it('should return a user for a valid token', async () => {
      const payload = { email: 'test@test.com', sub: '123', name: 'Test' };
      (admin.auth().verifyIdToken as jest.Mock).mockResolvedValue(payload);
      jest.spyOn(service, 'validateGoogleUser').mockResolvedValue({} as User);
      const result = await service.verifyGoogleTokenAndSignIn('valid-token');
      expect(result).toBeDefined();
    });

    it('should throw UnauthorizedException for invalid token payload', async () => {
      (admin.auth().verifyIdToken as jest.Mock).mockResolvedValue({
        email: null,
      });
      await expect(
        service.verifyGoogleTokenAndSignIn('invalid-token'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('confirmEmailVerification', () => {
    it('should verify user for valid token', async () => {
      jest
        .spyOn(userRepository, 'findByToken')
        .mockResolvedValue({ id: 1 } as User);
      await service.confirmEmailVerification('valid-token');
      expect(userRepository.verifyUser).toHaveBeenCalledWith(1);
    });

    it('should throw BadRequestException for invalid token', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      jest.spyOn(userRepository, 'findByToken').mockResolvedValue(null as any);
      await expect(
        service.confirmEmailVerification('invalid-token'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('sendPasswordResetEmail', () => {
    it('should send an email for a valid user', async () => {
      const user = {
        id: 1,
        email: 'test@test.com',
        name: 'Test',
        provider: 'local',
      };
      jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(user as User);
      await service.sendPasswordResetEmail('test@test.com');
      expect(emailService.sendPasswordResetEmail).toHaveBeenCalled();
    });

    it('should not send an email for a non-local user', async () => {
      const user = { provider: 'google' };
      jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(user as User);
      await service.sendPasswordResetEmail('test@test.com');
      expect(emailService.sendPasswordResetEmail).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('should reset password for a valid token', async () => {
      const payload = { id: 1, email: 'test@test.com' };
      const user = {
        id: 1,
        provider: 'local',
        salt: 'salt',
        passwordHash: 'oldhash',
      };
      const updatedUser = { ...user, passwordHash: 'newhash' };
      jest.spyOn(jwtService, 'verify').mockReturnValue(payload);
      jest.spyOn(userRepository, 'findById').mockResolvedValue(user as User);
      jest
        .spyOn(userRepository, 'updateUser')
        .mockResolvedValue(updatedUser as User);
      const result = await service.resetPassword('valid-token', 'newpassword');
      expect(result).toBeDefined();
    });

    it('should throw InvalidTokenError for an invalid token', async () => {
      jest.spyOn(jwtService, 'verify').mockImplementation(() => {
        throw new Error();
      });
      await expect(
        service.resetPassword('invalid-token', 'newpassword'),
      ).rejects.toThrow(InvalidTokenError);
    });

    it('should throw InvalidUserException for a non-local user', async () => {
      const payload = { id: 1, email: 'test@test.com' };
      const user = { provider: 'google' };
      jest.spyOn(jwtService, 'verify').mockReturnValue(payload);
      jest.spyOn(userRepository, 'findById').mockResolvedValue(user as User);
      await expect(
        service.resetPassword('valid-token', 'newpassword'),
      ).rejects.toThrow(InvalidUserException);
    });
  });
});
