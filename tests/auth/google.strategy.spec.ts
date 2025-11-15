import { Test, TestingModule } from '@nestjs/testing';
import { Profile } from 'passport-google-oauth20';
import { AuthService } from '../../src/auth/auth.service';
import { GoogleStrategy } from '../../src/auth/google.strategy';

describe('GoogleStrategy', () => {
  let strategy: GoogleStrategy;
  let authService: AuthService;

  const mockProfile: Profile = {
    id: '12345',
    displayName: 'Test User',
    emails: [{ value: 'test@example.com', verified: true }],
    provider: 'google',
    profileUrl: 'http://example.com/profile',
    _raw: '',
    _json: {
      sub: '12345',
      name: 'Test User',
      given_name: 'Test',
      family_name: 'User',
      picture: 'http://example.com/picture.jpg',
      email: 'test@example.com',
      email_verified: true,
      locale: 'en',
      iss: 'https://accounts.google.com',
      aud: 'test-client-id',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    },
  };

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    googleId: '12345',
  };

  beforeEach(async () => {
    process.env.GOOGLE_CLIENT_ID = 'test-client-id';
    process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';
    process.env.GOOGLE_CALLBACK_URL =
      'http://localhost:3000/auth/google/callback';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoogleStrategy,
        {
          provide: AuthService,
          useValue: {
            validateGoogleUser: jest.fn().mockResolvedValue(mockUser),
          },
        },
      ],
    }).compile();

    strategy = module.get<GoogleStrategy>(GoogleStrategy);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should call authService.validateGoogleUser with correct parameters', async () => {
      await strategy.validate('access-token', 'refresh-token', mockProfile);
      expect(authService.validateGoogleUser).toHaveBeenCalledWith({
        email: 'test@example.com',
        name: 'Test User',
        googleId: '12345',
      });
    });

    it('should return the user from authService.validateGoogleUser', async () => {
      const result = await strategy.validate(
        'access-token',
        'refresh-token',
        mockProfile,
      );
      expect(result).toEqual(mockUser);
    });
  });
});
