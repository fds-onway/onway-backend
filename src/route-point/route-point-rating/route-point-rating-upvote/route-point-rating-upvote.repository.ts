import { Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DrizzleService } from 'src/drizzle/drizzle.service';
import {
  routePointRatingUpvote,
  RoutePointRatingUpvote,
} from 'src/drizzle/schema';

@Injectable()
export class RoutePointRatingUpvoteRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async getByUser(
    userId: number,
    routePointRatingId: number,
  ): Promise<RoutePointRatingUpvote> {
    const [existingVote] = await this.drizzleService.db
      .select()
      .from(routePointRatingUpvote)
      .where(
        and(
          eq(routePointRatingUpvote.user, userId),
          eq(routePointRatingUpvote.routePointRating, routePointRatingId),
        ),
      );

    return existingVote;
  }

  async create(
    userId: number,
    routePointRatingId: number,
    vote: 1 | -1,
  ): Promise<RoutePointRatingUpvote> {
    const [createdVote] = await this.drizzleService.db
      .insert(routePointRatingUpvote)
      .values({ user: userId, routePointRating: routePointRatingId, vote })
      .returning();

    return createdVote;
  }

  async update(
    userId: number,
    routePointRatingId: number,
    vote: 1 | -1,
  ): Promise<RoutePointRatingUpvote> {
    const [updatedVote] = await this.drizzleService.db
      .update(routePointRatingUpvote)
      .set({ vote })
      .where(
        and(
          eq(routePointRatingUpvote.user, userId),
          eq(routePointRatingUpvote.routePointRating, routePointRatingId),
        ),
      )
      .returning();
    return updatedVote;
  }

  async delete(userId: number, routePointRatingId: number): Promise<void> {
    await this.drizzleService.db
      .delete(routePointRatingUpvote)
      .where(
        and(
          eq(routePointRatingUpvote.routePointRating, routePointRatingId),
          eq(routePointRatingUpvote.user, userId),
        ),
      );
  }
}
