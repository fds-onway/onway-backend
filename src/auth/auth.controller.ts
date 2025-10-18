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
import { ConflictErrorDTO, ValidationErrorDTO } from 'src/error.dto';
import {
  FailedLoginDTO,
  GoogleTokenDto,
  LoginDTO,
  SuccessfulLoginDTO,
} from './auth.dto';
import { AuthService } from './auth.service';

@Controller('auth')
@ApiTags('Autenticação')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    summary: 'Iniciar o fluxo de login com Google (Redirecionamento)',
  })
  @ApiResponse({
    status: HttpStatus.FOUND,
    description: 'Redirecionamento para a página de login do Google.',
  })
  @Get('google')
  @UseGuards(AuthGuard('google'))
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async googleAuth(@Req() req) {}

  @ApiOperation({
    summary: 'Rota de callback para o fluxo do Google OAuth2',
    description:
      'Esta rota é chamada pelo Google após o usuário conceder a permissão. Ela não deve ser chamada diretamente pelo cliente. O Google enviará um código que será trocado por um perfil de usuário, e a API retornará o JWT da aplicação.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Autenticação bem-sucedida. Retorna o token de acesso.',
    type: SuccessfulLoginDTO,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description:
      'O e-mail retornado pelo Google já está cadastrado com um provedor local (e-mail/senha).',
    type: ConflictErrorDTO,
  })
  @ApiResponse({
    status: HttpStatus.SERVICE_UNAVAILABLE,
    description: 'Falha na comunicação com o servidor do Google.',
  })
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

  @ApiOperation({
    summary: 'Autenticar usuário via Google (Mobile)',
    description:
      'Esta rota é para ser usada por aplicativos mobile (Android/iOS). O cliente mobile deve obter um `idToken` do SDK do Google Sign-In e enviá-lo no corpo desta requisição. A API irá verificar o token, encontrar ou criar o usuário, e retornar o JWT da aplicação.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      'Autenticação bem-sucedida. Retorna o token de acesso da sua aplicação.',
    type: SuccessfulLoginDTO,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'O `idToken` enviado no corpo da requisição é nulo ou mal formatado.',
    type: ValidationErrorDTO,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description:
      'O `idToken` do Google é inválido, expirou ou não pôde ser verificado.',
    type: FailedLoginDTO,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description:
      'O e-mail associado a este token do Google já está em uso por uma conta local (e-mail/senha).',
    type: ConflictErrorDTO,
  })
  @Post('google/token')
  async googleTokenSignIn(@Body() tokenDto: GoogleTokenDto) {
    const user = await this.authService.verifyGoogleTokenAndSignIn(
      tokenDto.idToken,
    );
    return this.authService.googleLogin(user as User);
  }
}
