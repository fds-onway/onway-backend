import { Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DrizzleService } from 'src/drizzle/drizzle.service';
import { routePointUpvote, RoutePointUpvote } from 'src/drizzle/schema';

@Injectable()
export class RoutePointUpvoteRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async getByUser(
    userId: number,
    routePointId: number,
  ): Promise<RoutePointUpvote> {
    const [existingVote] = await this.drizzleService.db
      .select()
      .from(routePointUpvote)
      .where(
        and(
          eq(routePointUpvote.user, userId),
          eq(routePointUpvote.routePoint, routePointId),
        ),
      );

    return existingVote;
  }

  async create(
    userId: number,
    routePointId: number,
    vote: 1 | -1,
  ): Promise<RoutePointUpvote> {
    const [createdVote] = await this.drizzleService.db
      .insert(routePointUpvote)
      .values({ user: userId, routePoint: routePointId, vote })
      .returning();
    return createdVote;
  }

  async update(
    userId: number,
    routePointId: number,
    vote: 1 | -1,
  ): Promise<RoutePointUpvote> {
    const [updatedVote] = await this.drizzleService.db
      .update(routePointUpvote)
      .set({ vote })
      .where(
        and(
          eq(routePointUpvote.user, userId),
          eq(routePointUpvote.routePoint, routePointId),
        ),
      )
      .returning();
    return updatedVote;
  }

  async delete(userId: number, routePointId: number): Promise<void> {
    await this.drizzleService.db
      .delete(routePointUpvote)
      .where(
        and(
          eq(routePointUpvote.routePoint, routePointId),
          eq(routePointUpvote.user, userId),
        ),
      );
  }
}
