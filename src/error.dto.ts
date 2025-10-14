import { ApiProperty } from '@nestjs/swagger';

export class ValidationErrorDTO {
  @ApiProperty({
    description: 'O código de status HTTP da resposta.',
    example: 400,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Uma lista de mensagens de erro de validação.',
    example: [
      'email must be an email',
      'password should not be empty',
      'name must be a string',
    ],
    type: [String],
  })
  message: string[];

  @ApiProperty({
    description: 'O nome do erro HTTP.',
    example: 'Bad Request',
  })
  error: string;
}

export class BadRequestErrorDTO {
  @ApiProperty({
    description: 'O código de status HTTP da resposta.',
    example: 400,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Uma mensagem informando por que a requisição foi inválida.',
    example: 'O ID fornecido não é um UUID válido.',
  })
  message: string;

  @ApiProperty({
    description: 'O nome do erro HTTP.',
    example: 'Bad Request',
  })
  error: string;
}

export class UnauthorizedErrorDTO {
  @ApiProperty({
    description: 'O código de status HTTP da resposta.',
    example: 401,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Uma mensagem informando que a autenticação é necessária.',
    example: 'Token de autenticação JWT ausente ou inválido.',
  })
  message: string;

  @ApiProperty({
    description: 'O nome do erro HTTP.',
    example: 'Unauthorized',
  })
  error: string;
}

export class ForbiddenErrorDTO {
  @ApiProperty({
    description: 'O código de status HTTP da resposta.',
    example: 403,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Uma mensagem informando que o acesso ao recurso foi negado.',
    example: 'O usuário não tem permissão para executar esta ação.',
  })
  message: string;

  @ApiProperty({
    description: 'O nome do erro HTTP.',
    example: 'Forbidden',
  })
  error: string;
}

export class NotFoundErrorDTO {
  @ApiProperty({
    description: 'O código de status HTTP da resposta.',
    example: 404,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Uma mensagem informando que o recurso não foi encontrado.',
    example: 'Usuário com o ID 123 não encontrado.',
  })
  message: string;

  @ApiProperty({
    description: 'O nome do erro HTTP.',
    example: 'Not Found',
  })
  error: string;
}

export class ConflictErrorDTO {
  @ApiProperty({
    description:
      'Uma mensagem clara e legível sobre o erro. Para erros de validação, pode ser um array de strings.',
    example: 'User with this e-mail already exists.',
  })
  message: string;

  @ApiProperty({
    description: 'O nome do erro HTTP correspondente ao status code.',
    example: 'Conflict',
  })
  error: string;

  @ApiProperty({
    description: 'O código de status HTTP da resposta.',
    example: 409,
  })
  statusCode: number;
}
