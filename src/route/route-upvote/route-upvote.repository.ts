import { Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DrizzleService } from 'src/drizzle/drizzle.service';
import { RouteUpvote, routeUpvote } from 'src/drizzle/schema';

@Injectable()
export class RouteUpvoteRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async getByUser(userId: number, routeId: number): Promise<RouteUpvote> {
    const [existingVote] = await this.drizzleService.db
      .select()
      .from(routeUpvote)
      .where(and(eq(routeUpvote.user, userId), eq(routeUpvote.route, routeId)));

    return existingVote;
  }

  async create(
    userId: number,
    routeId: number,
    vote: 1 | -1,
  ): Promise<RouteUpvote> {
    const [createdVote] = await this.drizzleService.db
      .insert(routeUpvote)
      .values({ user: userId, route: routeId, vote })
      .returning();
    return createdVote;
  }

  async update(userId: number, routeId: number, vote: 1 | -1) {
    const [updatedVote] = await this.drizzleService.db
      .update(routeUpvote)
      .set({ vote })
      .where(and(eq(routeUpvote.user, userId), eq(routeUpvote.route, routeId)))
      .returning();
    return updatedVote;
  }

  async delete(userId: number, routeId: number): Promise<void> {
    await this.drizzleService.db
      .delete(routeUpvote)
      .where(and(eq(routeUpvote.route, routeId), eq(routeUpvote.user, userId)));
  }
}
