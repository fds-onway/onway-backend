import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  NotFoundException,
  Post,
  Query,
  Redirect,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { User } from 'src/drizzle/schema';
import {
  ConflictErrorDTO,
  UnauthorizedErrorDTO,
  ValidationErrorDTO,
} from 'src/error.dto';
import { UserService } from 'src/user/user.service';
import {
  FailedLoginDTO,
  ForgotPasswordDTO,
  ForgotPasswordResponseDTO,
  GoogleTokenDto,
  LoginDTO,
  ResetPasswordDTO,
  ResetPasswordResponseDTO,
  SuccessfulLoginDTO,
} from './auth.dto';
import { InvalidTokenError, InvalidUserException } from './auth.exceptions';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

@Controller('auth')
@ApiTags('Autenticação')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @ApiOperation({
    summary: 'Iniciar o fluxo de login com Google (Redirecionamento)',
  })
  @ApiResponse({
    status: HttpStatus.FOUND,
    description: 'Redirecionamento para a página de login do Google.',
  })
  @Get('google')
  @UseGuards(PassportAuthGuard('google'))
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
  @UseGuards(PassportAuthGuard('google'))
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

  @ApiOperation({
    summary: 'Verificar o e-mail de um novo usuário',
    description:
      'Este endpoint é chamado pelo link enviado ao e-mail do usuário. Ele não deve ser chamado diretamente.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      'E-mail verificado com sucesso. Retorna um token de acesso para login automático.',
    type: SuccessfulLoginDTO,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'O token fornecido é inválido ou já foi usado.',
    type: ValidationErrorDTO,
  })
  @Get('verify-email')
  @Redirect(`${process.env.WEBSITE_BASE_URL!}/login`, 301)
  async verifyEmail(@Query('token') token: string) {
    await this.authService.confirmEmailVerification(token);
  }

  @ApiOperation({
    summary: 'Retorna os dados do usuário autenticado',
    description:
      'Endpoint para obter informações do usuário logado (nome, e-mail, etc).',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Dados do usuário autenticado.',
  })
  @UseGuards(AuthGuard)
  @Get('me')
  async getMe(@Headers('user-id') userId: number) {
    const user = await this.userService.getUserById(userId);

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }

  @ApiOperation({
    summary: 'Iniciar o processo de redefinição de senha',
    description:
      'Esta é a primeira rota. O usuário envia o e-mail e o backend dispara o envio do link de redefinição.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      'Solicitação recebida. Por razões de segurança, a resposta será sempre OK (200), mesmo que o e-mail não exista, para evitar a enumeração de usuários.',
    type: ForgotPasswordResponseDTO,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'O e-mail fornecido tem um formato inválido.',
    type: ValidationErrorDTO,
  })
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() body: ForgotPasswordDTO) {
    await this.authService.sendPasswordResetEmail(body.email);
    return {
      message:
        'Se um usuário com este e-mail estiver cadastrado, um link de redefinição será enviado.',
    };
  }

  @ApiOperation({
    summary: 'Efetivar a redefinição de senha',
    description:
      'Esta é a segunda rota. O frontend envia o token (recebido do link no e-mail) e a nova senha para finalizar o processo.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Senha redefinida com sucesso.',
    type: ResetPasswordResponseDTO,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'O token é inválido, expirou ou o usuário não foi encontrado.',
    type: UnauthorizedErrorDTO,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Os dados enviados são inválidos (ex: token não é JWT, senha é muito curta).',
    type: ValidationErrorDTO,
  })
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() body: ResetPasswordDTO) {
    try {
      await this.authService.resetPassword(body.token, body.password);
      return { message: 'Senha redefinida com sucesso.' };
    } catch (error) {
      if (error instanceof InvalidTokenError)
        throw new UnauthorizedException('Token inválido ou expirado');
      if (error instanceof InvalidUserException)
        throw new UnauthorizedException('Usuário não encontrado ou inválido');
    }
  }
}
