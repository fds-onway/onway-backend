/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, Logger } from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';
import { User } from 'src/drizzle/schema';
import { EmailService } from 'src/email/email.service';
import { RegisterUserDTO } from './user.dto';
import { SendEmailException } from './user.exceptions';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly emailService: EmailService,
  ) {}

  async createUser(registerUserDTO: RegisterUserDTO): Promise<Partial<User>> {
    const salt = this.createSalt();
    const verificationToken = this.createVerificationToken();

    const { name, email } = registerUserDTO;

    const user = await this.userRepository.createUser({
      name,
      email,
      salt,
      passwordHash: this.digest(`${salt}${registerUserDTO.password}`),
      verificationToken,
    });

    try {
      await this.emailService.sendVerificationEmail(
        user.email,
        user.name,
        verificationToken,
      );
    } catch (error) {
      await this.userRepository.deleteUser(user.id);
      this.logger.error('Erro ao enviar email', error);
      throw new SendEmailException(
        `Error while sending mail to ${user.email}: ${error}`,
      );
    }

    const { passwordHash, salt: _, ...returningUser } = user;
    return returningUser;
  }

  async createFromGoogle(details: {
    name: string;
    email: string;
    googleId: string;
  }): Promise<Partial<User>> {
    const user = await this.userRepository.createUser({
      ...details,
      provider: 'google',
      isVerified: true,
    });

    const { passwordHash, salt, ...returningUser } = user;
    return returningUser as User;
  }

  private digest(input: string): string {
    return createHash('sha256').update(input).digest('hex');
  }

  private createSalt(lenght: number = 16): string {
    return randomBytes(lenght).toString('hex').substring(0, lenght);
  }

  private createVerificationToken(length: number = 32): string {
    return randomBytes(length).toString('hex');
  }

  async getUserById(id: number): Promise<Partial<User>> {
    return this.userRepository.findById(id);
  }
}
