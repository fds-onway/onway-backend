import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash } from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { User } from 'src/drizzle/schema';
import UserRepository from 'src/user/user.repository';
import { UserService } from 'src/user/user.service';
import { LoginDTO } from './auth.dto';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    private readonly userService: UserService,
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {
    this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
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
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async login(userDto: LoginDTO) {
    try {
      const user = await this.userRepository.findByEmail(userDto.email);

      const requestPasswordHash = this.digest(
        `${user.salt}${userDto.password}`,
      );

      if (requestPasswordHash !== user.passwordHash) {
        throw new Error();
      }

      const payload = { id: user.id, email: user.email, role: user.role };
      return {
        accessToken: this.jwtService.sign(payload),
      };
    } catch {
      throw new Error('Usuário ou senha incorretos');
    }
  }

  async verifyGoogleTokenAndSignIn(idToken: string): Promise<Partial<User>> {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID!,
      });

      const payload = ticket.getPayload();

      if (!payload || !payload.email) {
        throw new BadRequestException('Invalid Google token.');
      }

      const user = await this.validateGoogleUser({
        email: payload.email,
        name: payload.name!,
        googleId: payload.sub,
      });

      return user;
    } catch {
      throw new UnauthorizedException('Google token verification failed');
    }
  }

  private digest(input: string): string {
    return createHash('sha256').update(input).digest('hex');
  }
}
