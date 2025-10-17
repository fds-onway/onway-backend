import { ConflictException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/drizzle/schema';
import UserRepository from 'src/user/user.repository';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

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

  login(user: User) {
    const payload = { id: user.id, email: user.email, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
