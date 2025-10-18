import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation } from '@nestjs/swagger';
import { Request } from 'express';
import { User } from 'src/drizzle/schema';
import { LoginDTO } from './auth.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async googleAuth(@Req() req) {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(@Req() req: Request) {
    return this.authService.googleLogin(req.user as User);
  }

  @ApiOperation({
    summary: 'Realizar login convencional (com usuário e senha)',
  })
  @Post('user')
  @HttpCode(HttpStatus.OK)
  async userAuth(@Body() dto: LoginDTO) {
    try {
      return await this.authService.login(dto);
    } catch {
      throw new UnauthorizedException('Usuário ou senha incorretos');
    }
  }
}
