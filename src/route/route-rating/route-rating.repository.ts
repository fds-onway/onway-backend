import { Injectable } from '@nestjs/common';
import { and, desc, eq, sql } from 'drizzle-orm';
import { DrizzleService } from 'src/drizzle/drizzle.service';
import {
  routeRating,
  RouteRating,
  routeRatingUpvote,
  user,
} from 'src/drizzle/schema';
import { EditRouteRatingDTO, NewRouteRatingDTO } from './route-rating.dto';

@Injectable()
export class RouteRatingRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async create(
    routeId: number,
    userId: number,
    dto: NewRouteRatingDTO,
  ): Promise<RouteRating> {
    const [createdRouteRating] = await this.drizzleService.db
      .insert(routeRating)
      .values({ ...dto, user: userId, route: routeId })
      .returning();

    return createdRouteRating;
  }

  async getUserRating(
    routeId: number,
    userId: number,
  ): Promise<RouteRating | undefined> {
    const [rating] = await this.drizzleService.db
      .select()
      .from(routeRating)
      .where(and(eq(routeRating.user, userId), eq(routeRating.route, routeId)));

    return rating;
  }

  async getRatingById(id: number): Promise<RouteRating | undefined> {
    const [rating] = await this.drizzleService.db
      .select()
      .from(routeRating)
      .where(eq(routeRating.id, id));

    return rating;
  }

  async getAllReviewsInOneRoute(routeId: number) {
    const upvotesSq = sql`(
      SELECT COALESCE(SUM(${routeRatingUpvote.vote}), 0)
      FROM ${routeRatingUpvote}
      WHERE ${routeRatingUpvote.routeRating} = ${routeRating.id}
    )`;

    const routeReviews = await this.drizzleService.db
      .select({
        id: routeRating.id,
        title: routeRating.title,
        description: routeRating.description,
        rating: routeRating.review,
        upvotes: upvotesSq.mapWith(Number),
        authorName: user.name,
        createdAt: routeRating.createdAt,
      })
      .from(routeRating)
      .innerJoin(user, eq(routeRating.user, user.id))
      .where(eq(routeRating.route, routeId))
      .groupBy(
        routeRating.id,
        routeRating.title,
        routeRating.description,
        routeRating.review,
        user.name,
        routeRating.createdAt,
      )
      .orderBy(desc(upvotesSq), desc(routeRating.createdAt));

    return routeReviews;
  }

  async edit(
    routeRatingId: number,
    dto: EditRouteRatingDTO,
  ): Promise<RouteRating> {
    const [editedRoute] = await this.drizzleService.db
      .update(routeRating)
      .set(dto)
      .where(eq(routeRating.id, routeRatingId))
      .returning();
    return editedRoute;
  }

  async delete(routeRatingId: number): Promise<void> {
    await this.drizzleService.db
      .delete(routeRating)
      .where(eq(routeRating.id, routeRatingId));
  }
}
