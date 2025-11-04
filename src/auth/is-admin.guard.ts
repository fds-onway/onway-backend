import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { request } from 'express';
import { User } from 'src/drizzle/schema';
import { AuthGuard } from './auth.guard';

@Injectable()
export class IsAdminGuard implements CanActivate {
  constructor(
    private readonly authGuard: AuthGuard,
    private readonly jwtService: JwtService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    this.authGuard.canActivate(context);

    const [, token] = request.headers['authorization']!.split(' ');

    const payload = this.jwtService.verify<Partial<User>>(token);

    if (payload.role !== 'admin') {
      throw new ForbiddenException('User is not admin.');
    }

    return true;
  }
}
