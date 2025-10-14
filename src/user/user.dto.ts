import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterUserDTO {
  @ApiProperty({
    example: 'John Doe',
    description: 'O nome completo do usuário, tendo no mínimo duas palavras',
    required: true,
  })
  @IsString()
  @MaxLength(256)
  @Matches(/^\S+(\s+\S+)+$/, {
    message: 'O nome deve conter pelo menos duas palavras.',
  })
  name: string;

  @ApiProperty({
    example: 'test@example.com',
    description: 'O e-mail que será utilizado no cadastro',
    required: true,
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'SenhaLegal123!',
    description:
      'A senha do usuário, devendo ter no mínimo 8 caracteres, 1 número e 1 caracter especial',
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

export class CreatedUserDTO {
  @ApiProperty({
    description: 'O ID único do usuário gerado pelo banco de dados.',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'O nome completo do usuário.',
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    description: 'O e-mail único do usuário.',
    example: 'test@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'O nível de permissão do usuário no sistema.',
    example: 'user',
    enum: ['admin', 'user'],
  })
  role: string;

  @ApiProperty({
    description: 'A data e hora em que o registro do usuário foi criado.',
    example: '2023-10-27T10:00:00.000Z',
    type: 'string',
    format: 'date-time',
  })
  createdAt: Date;
}
