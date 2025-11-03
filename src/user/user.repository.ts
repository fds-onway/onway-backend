import { Injectable } from '@nestjs/common';
import { DrizzleQueryError, eq } from 'drizzle-orm';
import { DrizzleService } from 'src/drizzle/drizzle.service';
import { NewUser, user, User, user as userModel } from 'src/drizzle/schema';
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

  async findByEmail(email: string): Promise<User> {
    const [user] = await this.drizzleService.db
      .select()
      .from(userModel)
      .where(eq(userModel.email, email));

    return user;
  }

  async findByToken(token: string): Promise<User> {
    const [user] = await this.drizzleService.db
      .select()
      .from(userModel)
      .where(eq(userModel.verificationToken, token));

    return user;
  }

  async verifyUser(userId: number): Promise<User> {
    const [updatedUser] = await this.drizzleService.db
      .update(userModel)
      .set({
        isVerified: true,
        verificationToken: null,
      })
      .where(eq(userModel.id, userId))
      .returning();

    return updatedUser;
  }

  async deleteUser(userId: number): Promise<void> {
    await this.drizzleService.db.delete(user).where(eq(user.id, userId));
  }
}
