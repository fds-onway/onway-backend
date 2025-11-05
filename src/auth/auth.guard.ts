import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { User } from 'src/drizzle/schema';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request: Request = context.switchToHttp().getRequest();

    const authorization = request.headers['authorization'];
    if (!authorization || authorization === undefined) {
      throw new UnauthorizedException(
        "Required header 'authorization' not found in request",
      );
    }

    const [type, token] = authorization.split(' ');

    if (type !== 'Bearer')
      throw new UnauthorizedException('Invalid type of authorization token');

    if (!token) throw new UnauthorizedException('Token not found');

    try {
      const user = this.jwtService.verify<Partial<User>>(token);

      request.headers['user-id'] = user.id!.toString();
    } catch {
      throw new UnauthorizedException('Invalid authorization token');
    }

    return true;
  }
}
