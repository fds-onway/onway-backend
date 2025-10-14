import { Body, ConflictException, Controller, Post } from '@nestjs/common';
import { RegisterUserDTO } from './user.dto';
import { UserExistsException } from './user.exceptions';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

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
