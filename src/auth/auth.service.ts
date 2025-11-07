import {
  BadRequestException,
  ConflictException,
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash } from 'crypto';
import * as admin from 'firebase-admin';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';
import { User } from 'src/drizzle/schema';
import { UserRepository } from 'src/user/user.repository';
import { UserService } from 'src/user/user.service';
import { LoginDTO } from './auth.dto';

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly frontendUrl = process.env.API_BASE_URL!;

  constructor(
    private readonly userService: UserService,
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  onModuleInit() {
    try {
      const decodedKey = Buffer.from(
        process.env.FIREBASE_ADMIN_SECRET_BASE64!,
        'base64',
      ).toString('utf-8');

      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert(
            JSON.parse(decodedKey) as admin.ServiceAccount,
          ),
        });
      }
    } catch (error) {
      console.error(
        'Falha ao carregar firebase-admin-key.json:',
        (error as Error).message,
      );
      throw new Error('Não foi possível inicializar o Firebase Admin.');
    }
  }

  async validateGoogleUser(details: {
    email: string;
    name: string;
    googleId: string;
  }) {
    const user = await this.userRepository.findByEmail(details.email);
    if (user) {
      if (user.provider === 'local') {
        throw new ConflictException(
          'Usuário com esse e-mail já existe, por favor faça login com sua senha.',
        );
      }
      return user;
    }
    return this.userService.createFromGoogle(details);
  }

  googleLogin(user: User) {
    const payload = { id: user.id, email: user.email, role: user.role };

    const now = new Date();

    const nowTimestamp = now.getTime();
    const expirationDateTimestamp = nowTimestamp + 1000 * 2_592_000;

    const expirationDate = new Date(expirationDateTimestamp);

    return {
      accessToken: this.jwtService.sign(payload),
      expirationDate: expirationDate.toISOString(),
    };
  }

  async login(userDto: LoginDTO) {
    try {
      const user = await this.userRepository.findByEmail(userDto.email);

      if (user.provider === 'local' && !user.isVerified) {
        throw new UnauthorizedException(
          'Por favor, verifique seu e-mail antes de fazer login.',
        );
      }

      const requestPasswordHash = this.digest(
        `${user.salt}${userDto.password}`,
      );

      if (requestPasswordHash !== user.passwordHash) {
        throw new Error();
      }

      const payload = { id: user.id, email: user.email, role: user.role };

      const now = new Date();

      const nowTimestamp = now.getTime();
      const expirationDateTimestamp = nowTimestamp + 1000 * 2_592_000;

      const expirationDate = new Date(expirationDateTimestamp);

      return {
        accessToken: this.jwtService.sign(payload),
        expirationDate: expirationDate.toISOString(),
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new Error('Usuário ou senha incorretos');
    }
  }

  async verifyGoogleTokenAndSignIn(idToken: string): Promise<Partial<User>> {
    try {
      const payload: DecodedIdToken = await admin.auth().verifyIdToken(idToken);

      if (!payload || !payload.email) {
        throw new BadRequestException('Invalid Firebase token.');
      }

      const user = await this.validateGoogleUser({
        email: payload.email,
        name: (payload.name || 'Nome do Usuário Google') as string,
        googleId: payload.sub,
      });

      return user;
    } catch (error) {
      console.log((error as Error).message);
      throw new UnauthorizedException('Firebase token verification failed');
    }
  }

  async confirmEmailVerification(token: string) {
    const user = await this.userRepository.findByToken(token);

    if (!user) {
      throw new BadRequestException(
        'Token de verificação inválido ou expirado.',
      );
    }

    await this.userRepository.verifyUser(user.id);

    return {};
  }

  private digest(input: string): string {
    return createHash('sha256').update(input).digest('hex');
  }
}
