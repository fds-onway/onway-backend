/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';
import { User } from 'src/drizzle/schema';
import { RegisterUserDTO } from './user.dto';
import UserRepository from './user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async createUser(registerUserDTO: RegisterUserDTO): Promise<Partial<User>> {
    const salt = this.createSalt();

    const { name, email } = registerUserDTO;

    const user = await this.userRepository.createUser({
      name,
      email,
      salt,
      passwordHash: this.digest(`${salt}${registerUserDTO.password}`),
    });

    const { passwordHash, salt: _, ...returningUser } = user;
    return returningUser;
  }

  private digest(input: string): string {
    return createHash('sha256').update(input).digest('hex');
  }
  private createSalt(lenght: number = 16): string {
    return randomBytes(lenght).toString('hex').substring(0, lenght);
  }
}
