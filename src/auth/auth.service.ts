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
import { EmailService } from 'src/email/email.service';
import { UserRepository } from 'src/user/user.repository';
import { UserService } from 'src/user/user.service';
import { LoginDTO } from './auth.dto';
import { InvalidTokenError, InvalidUserException } from './auth.exceptions';

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly passwordTokenSecret = process.env.PASSWORD_RESET_TOKEN!;

  constructor(
    private readonly userService: UserService,
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
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
    } catch {
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

  async sendPasswordResetEmail(email: string) {
    const user = await this.userRepository.findByEmail(email);

    if (!user || user.provider !== 'local') return;

    const payload = { id: user.id, email: user.email };
    const resetToken = this.jwtService.sign(payload, {
      secret: this.passwordTokenSecret,
      expiresIn: '10m',
    });

    await this.emailService.sendPasswordResetEmail(
      user.email,
      user.name,
      resetToken,
    );
  }

  async resetPassword(token: string, newPassword: string): Promise<User> {
    let payload: { id: number; email: string };

    try {
      payload = this.jwtService.verify(token, {
        secret: this.passwordTokenSecret,
      });
    } catch {
      throw new InvalidTokenError('Token inválido ou expirado');
    }

    const user = await this.userRepository.findById(payload.id);

    if (!user || user.provider !== 'local' || !user.salt)
      throw new InvalidUserException('Usuário não encontrado ou inválido');

    const newPasswordHash = this.digest(`${user.salt}${newPassword}`);

    const updatedUser = await this.userRepository.updateUser(user.id, {
      passwordHash: newPasswordHash,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, salt, verificationToken, ...returningUser } =
      updatedUser;

    return returningUser as User;
  }

  private digest(input: string): string {
    return createHash('sha256').update(input).digest('hex');
  }
}
