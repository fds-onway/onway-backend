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
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { User } from 'src/drizzle/schema';
import { ValidationErrorDTO } from 'src/error.dto';
import { FailedLoginDTO, LoginDTO, SuccessfulLoginDTO } from './auth.dto';
import { AuthService } from './auth.service';

@Controller('auth')
@ApiTags('Autenticação')
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
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Usuário realizou login com sucesso',
    type: SuccessfulLoginDTO,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Algum dado enviado é inválido',
    type: ValidationErrorDTO,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description:
      'A tentativa de login falhou por conta de algum dado incorreto.',
    type: FailedLoginDTO,
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
