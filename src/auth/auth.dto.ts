import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsISO8601,
  IsJWT,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

class LoginDTO {
  @ApiProperty({
    example: 'test@example.com',
    description: 'O e-mail que será utilizado para a tentativa de login',
    required: true,
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'SenhaLegal123!',
    description: 'A senha que será utilizada para a tentativa de login',
    required: true,
  })
  @IsString()
  password: string;
}

class GoogleTokenDto {
  @ApiProperty({
    description:
      'O ID Token JWT fornecido pelo SDK do Google Sign-In no cliente mobile',
  })
  @IsString()
  idToken: string;
}

class SuccessfulLoginDTO {
  @ApiProperty({
    example:
      'dmVudG8gYXp1bCB0ZWNsYWRvIG1hw6fDoyBnaXJhc3NvbCBjYW1pbmhvIHBvbnRlIHJlbMOzZ2lvIHNvbWJyYSBlc3RyZWxhIGNvcG8gbGl2cm8gamFuZWxhIHBlZHJhIGFiYWNhdGUgc29uaG8gY2FkZWl',
    description: 'O token JWT de login, possui duração de 1 mês',
  })
  accessToken: string;

  @ApiProperty({
    example: '2025-11-03T22:00:00:000Z',
    description: 'A data e hora que o token irá expirar em formato ISO-8601',
  })
  @IsISO8601()
  expirationDate: Date;
}

class FailedLoginDTO {
  @ApiProperty({
    description: 'O código de status HTTP da resposta.',
    example: 401,
  })
  statusCode: number;

  @ApiProperty({
    description: 'A mensagem de erro de login.',
    example: 'Usuário ou senha incorretos',
  })
  message: string;

  @ApiProperty({
    description: 'O nome do erro HTTP.',
    example: 'Unauthorized',
  })
  error: string;
}

class ForgotPasswordDTO {
  @ApiProperty({
    example: 'test@example.com',
    description: 'O e-mail do usuário que esqueceu a senha',
    required: true,
  })
  @IsString()
  @IsEmail()
  email: string;
}

class ResetPasswordDTO {
  @ApiProperty({
    example: 'UuzMfGGSKogEBEaBaHAwmDCpCDzTiyAy',
    description:
      'O token que você recebeu no e-mail na rota /auth/forgot-password',
    required: true,
  })
  @IsJWT()
  token: string;

  @ApiProperty({
    example: 'SenhaLegal123!',
    description:
      'A nova senha do usuário, devendo ter no mínimo 8 caracteres, 1 número e 1 caracter especial, veja se se lembra dessa vez!',
    minLength: 8,
    required: true,
  })
  @IsString()
  @MinLength(8, { message: 'A senha deve ter no mínimo 8 caracteres' })
  @Matches(/[^a-zA-Z0-9]/, {
    message: 'A senha deve conter pelo menos um caractere especial.',
  })
  password: string;
}

class ForgotPasswordResponseDTO {
  @ApiProperty({
    description: 'Mensagem genérica de sucesso.',
    example:
      'Se um usuário com este e-mail estiver cadastrado, um link de redefinição será enviado.',
  })
  message: string;
}

class ResetPasswordResponseDTO {
  @ApiProperty({
    description: 'Mensagem de sucesso na redefinição.',
    example: 'Senha redefinida com sucesso.',
  })
  message: string;
}

export {
  FailedLoginDTO,
  ForgotPasswordDTO,
  ForgotPasswordResponseDTO,
  GoogleTokenDto,
  LoginDTO,
  ResetPasswordDTO,
  ResetPasswordResponseDTO,
  SuccessfulLoginDTO
};

