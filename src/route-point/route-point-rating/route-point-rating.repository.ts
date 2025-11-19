import { Injectable } from '@nestjs/common';
import { and, desc, eq, sql } from 'drizzle-orm';
import { DrizzleService } from 'src/drizzle/drizzle.service';
import {
  routePointRating,
  RoutePointRating,
  routePointRatingUpvote,
  user,
} from 'src/drizzle/schema';
import {
  EditRoutePointRatingDTO,
  NewRoutePointRatingDTO,
} from './route-point-rating.dto';

@Injectable()
export class RoutePointRatingRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async create(
    routePointId: number,
    userId: number,
    dto: NewRoutePointRatingDTO,
  ): Promise<RoutePointRating> {
    const [rating] = await this.drizzleService.db
      .insert(routePointRating)
      .values({ ...dto, user: userId, routePoint: routePointId })
      .returning();

    return rating;
  }

  async getUserRating(
    routePointId: number,
    userId: number,
  ): Promise<RoutePointRating | undefined> {
    const [rating] = await this.drizzleService.db
      .select()
      .from(routePointRating)
      .where(
        and(
          eq(routePointRating.user, userId),
          eq(routePointRating.routePoint, routePointId),
        ),
      );

    return rating;
  }

  async getRatingById(id: number): Promise<RoutePointRating | undefined> {
    const [rating] = await this.drizzleService.db
      .select()
      .from(routePointRating)
      .where(eq(routePointRating.id, id));

    return rating;
  }

  async getAllReviewsInOneRoutePoint(routePointId: number) {
    const upvotesSq = sql`(
      SELECT COALESCE(SUM(${routePointRatingUpvote.vote}), 0)
      FROM ${routePointRatingUpvote}
      WHERE ${routePointRatingUpvote.routePointRating} = ${routePointRating.id}
    )`;

    const routePointReviews = await this.drizzleService.db
      .select({
        id: routePointRating.id,
        title: routePointRating.title,
        description: routePointRating.description,
        rating: routePointRating.review,
        upvotes: upvotesSq.mapWith(Number),
        authorName: user.name,
        createdAt: routePointRating.createdAt,
      })
      .from(routePointRating)
      .innerJoin(user, eq(routePointRating.user, user.id))
      .where(eq(routePointRating.routePoint, routePointId))
      .groupBy(
        routePointRating.id,
        routePointRating.title,
        routePointRating.description,
        routePointRating.review,
        user.name,
        routePointRating.createdAt,
      )
      .orderBy(desc(upvotesSq), desc(routePointRating.createdAt));

    return routePointReviews;
  }

  async edit(
    routePointRatingId: number,
    dto: EditRoutePointRatingDTO,
  ): Promise<RoutePointRating> {
    const [editedRating] = await this.drizzleService.db
      .update(routePointRating)
      .set(dto)
      .where(eq(routePointRating.id, routePointRatingId))
      .returning();

    return editedRating;
  }

  async delete(routePointRatingId: number): Promise<void> {
    await this.drizzleService.db
      .delete(routePointRating)
      .where(eq(routePointRating.id, routePointRatingId));
  }
}
