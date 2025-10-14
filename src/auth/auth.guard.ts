import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

type UserRole = 'admin' | 'user';

type UserPayload = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
};

export type RequestWithUser = {
  user: UserPayload;
} & Request;

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request: RequestWithUser = context.switchToHttp().getRequest();

    const authorization = request.headers['authorization'];
    if (!authorization || authorization === undefined) {
      throw new BadRequestException(
        "Required header 'authorization' not found in request",
      );
    }

    const [type, token] = authorization.split(' ');

    if (type !== 'Bearer')
      throw new BadRequestException('Invalid type of authorization token');

    if (!token) throw new BadRequestException('Token not found');

    try {
      const payload = this.jwtService.verify<UserPayload>(token);

      request.user = payload;
    } catch {
      throw new BadRequestException('Invalid authorization token');
    }

    return true;
  }
}
