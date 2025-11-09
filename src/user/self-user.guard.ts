import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from 'src/drizzle/schema';

@Injectable()
export class SelfUserGuard implements CanActivate {
  constructor(
    private readonly authGuard: AuthGuard,
    private readonly jwtService: JwtService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    this.authGuard.canActivate(context);

    const request: Request = context.switchToHttp().getRequest();
    const [, token] = request.headers['authorization']!.split(' ');
    const payload = this.jwtService.verify<Partial<User>>(token);

    const { userId } = request.params ?? {};
    // Passamos como true porque significa que a requisição não tem este parâmetro
    if (!userId) return true;

    if (payload.id !== parseInt(userId)) {
      throw new ForbiddenException(
        'Você não tem permissão para executar esta ação',
      );
    }

    return true;
  }
}
