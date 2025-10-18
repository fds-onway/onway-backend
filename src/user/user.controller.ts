import {
  Body,
  ConflictException,
  Controller,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ConflictErrorDTO, ValidationErrorDTO } from 'src/error.dto';
import { CreatedUserDTO, RegisterUserDTO } from './user.dto';
import { UserExistsException } from './user.exceptions';
import { UserService } from './user.service';

@Controller('user')
@ApiTags('Usuários')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Criar um novo usuário' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Usuário foi criado com sucesso',
    type: CreatedUserDTO,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Algum dado enviado é inválido',
    type: ValidationErrorDTO,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Já existe um usuário com o e-mail especificado',
    type: ConflictErrorDTO,
  })
  @Post('register')
  async register(@Body() body: RegisterUserDTO) {
    try {
      return await this.userService.createUser(body);
    } catch (error) {
      if (error instanceof UserExistsException)
        throw new ConflictException('User with this e-mail already exists.');
    }
  }
}
