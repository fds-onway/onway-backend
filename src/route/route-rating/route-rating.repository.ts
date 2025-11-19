import { Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DrizzleService } from 'src/drizzle/drizzle.service';
import { routeRating, RouteRating } from 'src/drizzle/schema';
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
