import { Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DrizzleService } from 'src/drizzle/drizzle.service';
import { RouteRatingUpvote, routeRatingUpvote } from 'src/drizzle/schema';

@Injectable()
export class RouteRatingUpvoteRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async getByUser(
    userId: number,
    routeRatingId: number,
  ): Promise<RouteRatingUpvote> {
    const [existingVote] = await this.drizzleService.db
      .select()
      .from(routeRatingUpvote)
      .where(
        and(
          eq(routeRatingUpvote.user, userId),
          eq(routeRatingUpvote.routeRating, routeRatingId),
        ),
      );

    return existingVote;
  }

  async create(
    userId: number,
    routeRatingId: number,
    vote: 1 | -1,
  ): Promise<RouteRatingUpvote> {
    const [createdVote] = await this.drizzleService.db
      .insert(routeRatingUpvote)
      .values({ user: userId, routeRating: routeRatingId, vote })
      .returning();
    return createdVote;
  }

  async update(
    userId: number,
    routeRatingId: number,
    vote: 1 | -1,
  ): Promise<RouteRatingUpvote> {
    const [updatedVote] = await this.drizzleService.db
      .update(routeRatingUpvote)
      .set({ vote })
      .where(
        and(
          eq(routeRatingUpvote.user, userId),
          eq(routeRatingUpvote.routeRating, routeRatingId),
        ),
      )
      .returning();
    return updatedVote;
  }

  async delete(userId: number, routeRatingId: number): Promise<void> {
    await this.drizzleService.db
      .delete(routeRatingUpvote)
      .where(
        and(
          eq(routeRatingUpvote.routeRating, routeRatingId),
          eq(routeRatingUpvote.user, userId),
        ),
      );
  }
}
