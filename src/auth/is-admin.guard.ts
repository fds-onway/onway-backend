import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RequestWithUser } from './auth.guard';

@Injectable()
export class IsAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request: RequestWithUser = context.switchToHttp().getRequest();

    if (!request.user || request.user === undefined) {
      throw new UnauthorizedException('User not defined.');
    }

    if (request.user.role !== 'admin') {
      throw new UnauthorizedException('User is not admin.');
    }

    return true;
  }
}
