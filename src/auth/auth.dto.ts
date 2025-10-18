import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDTO {
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

export class SuccessfulLoginDTO {
  @ApiProperty({
    example:
      'dmVudG8gYXp1bCB0ZWNsYWRvIG1hw6fDoyBnaXJhc3NvbCBjYW1pbmhvIHBvbnRlIHJlbMOzZ2lvIHNvbWJyYSBlc3RyZWxhIGNvcG8gbGl2cm8gamFuZWxhIHBlZHJhIGFiYWNhdGUgc29uaG8gY2FkZWl',
    description: 'O token JWT de login, possui duração de 1 mês',
  })
  accessToken: string;
}

export class FailedLoginDTO {
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
