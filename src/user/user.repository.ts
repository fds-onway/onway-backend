import { Injectable } from '@nestjs/common';
import { DrizzleQueryError } from 'drizzle-orm';
import { DrizzleService } from 'src/drizzle/drizzle.service';
import { NewUser, User, user as userModel } from 'src/drizzle/schema';
import { UserExistsException } from './user.exceptions';

@Injectable()
export default class UserRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async createUser(newUserDTO: NewUser): Promise<User> {
    let createdUser: User;
    try {
      [createdUser] = await this.drizzleService.db
        .insert(userModel)
        .values(newUserDTO)
        .returning();
    } catch (error) {
      if (error instanceof Error && error instanceof DrizzleQueryError) {
        throw new UserExistsException();
      }

      throw error;
    }

    return createdUser;
  }
}
