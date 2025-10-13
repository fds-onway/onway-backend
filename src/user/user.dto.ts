import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterUserDTO {
  @IsString()
  @MaxLength(256)
  @Matches(/^\S+(\s+\S+)+$/, {
    message: 'O nome deve conter pelo menos duas palavras.',
  })
  name: string;

  @ApiProperty({
    example: 'test@example.com',
    description: 'O e-mail que será utilizado no cadastro',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'SenhaLegal123!',
    description:
      'A senha do usuário, devendo ter no mínimo 8 caracteres, 1 número e 1 caracter especial',
    minLength: 8,
  })
  @IsString()
  @MinLength(8, { message: 'A senha deve ter no mínimo 8 caracteres' })
  @Matches(/[^a-zA-Z0-9]/, {
    message: 'A senha deve conter pelo menos um caractere especial.',
  })
  password: string;
}
