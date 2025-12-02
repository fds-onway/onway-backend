import { Injectable } from '@nestjs/common';
import { and, count, desc, eq, isNotNull, isNull } from 'drizzle-orm';
import { DrizzleService } from 'src/drizzle/drizzle.service';
import { routeProgress, RouteProgress } from 'src/drizzle/schema';

@Injectable()
export class ProgressRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async create(
    userId: number,
    routeId: number,
    routePointId: number,
  ): Promise<RouteProgress> {
    const [createdRouteProgress] = await this.drizzleService.db
      .insert(routeProgress)
      .values({
        user: userId,
        route: routeId,
        lastPoint: routePointId,
        updatedAt: new Date(),
      })
      .returning();

    return createdRouteProgress;
  }

  async editLastPoint(
    userId: number,
    routeId: number,
    routePointId: number,
  ): Promise<RouteProgress> {
    const [editedRouteProgress] = await this.drizzleService.db
      .update(routeProgress)
      .set({ lastPoint: routePointId, updatedAt: new Date() })
      .where(
        and(eq(routeProgress.user, userId), eq(routeProgress.route, routeId)),
      )
      .returning();

    return editedRouteProgress;
  }

  async getAllRoutesWithProgressByUser(
    userId: number,
  ): Promise<Array<RouteProgress>> {
    return await this.drizzleService.db
      .select()
      .from(routeProgress)
      .where(eq(routeProgress.user, userId))
      .orderBy(desc(routeProgress.updatedAt));
  }

  async getRouteProgress(
    userId: number,
    routeId: number,
  ): Promise<RouteProgress | undefined> {
    const [rp] = await this.drizzleService.db
      .select()
      .from(routeProgress)
      .where(
        and(eq(routeProgress.user, userId), eq(routeProgress.route, routeId)),
      );

    return rp;
  }

  async deleteProgress(userId: number, routeId: number) {
    await this.drizzleService.db
      .delete(routeProgress)
      .where(
        and(eq(routeProgress.user, userId), eq(routeProgress.route, routeId)),
      );
  }

  async setAsCompleted(userId: number, routeId: number) {
    const [completedRoute] = await this.drizzleService.db
      .update(routeProgress)
      .set({ completedAt: new Date(), updatedAt: new Date() })
      .where(
        and(eq(routeProgress.user, userId), eq(routeProgress.route, routeId)),
      )
      .returning();

    return completedRoute;
  }

  async getTotalCompletedRoutes(): Promise<number> {
    const [quantityObj] = await this.drizzleService.db
      .select({
        quantity: count(routeProgress.id),
      })
      .from(routeProgress)
      .where(isNotNull(routeProgress.completedAt));

    return quantityObj.quantity;
  }

  async getTotalProgressingRoutes(): Promise<number> {
    const [quantityObj] = await this.drizzleService.db
      .select({
        quantity: count(routeProgress.id),
      })
      .from(routeProgress)
      .where(isNull(routeProgress.completedAt));

    return quantityObj.quantity;
  }
}
