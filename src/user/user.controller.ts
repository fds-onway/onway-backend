import { Body, ConflictException, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ConflictErrorDTO, ValidationErrorDTO } from 'src/error.dto';
import { CreatedUserDTO, RegisterUserDTO } from './user.dto';
import { UserExistsException } from './user.exceptions';
import { UserService } from './user.service';

@Controller('user')
@ApiTags('auth')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Criar um novo usuário' })
  @ApiResponse({
    status: 201,
    description: 'Usuário foi criado com sucesso',
    type: CreatedUserDTO,
  })
  @ApiResponse({
    status: 400,
    description: 'Algum dado enviado é inválido',
    type: ValidationErrorDTO,
  })
  @ApiResponse({
    status: 409,
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
