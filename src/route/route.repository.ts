import { Injectable } from '@nestjs/common';
import { asc, eq, ExtractTablesWithRelations, sql } from 'drizzle-orm';
import { NodePgQueryResultHKT } from 'drizzle-orm/node-postgres';
import { PgTransaction } from 'drizzle-orm/pg-core';
import { CdnService } from 'src/cdn/cdn.service';
import { DrizzleService } from 'src/drizzle/drizzle.service';
import * as schema from 'src/drizzle/schema';
import {
  NewRoute,
  NewRouteImage,
  NewRouteTag,
  route,
  Route,
  routeImage,
  routePoint,
  RouteTag,
  routeTag,
  user,
} from 'src/drizzle/schema';
import { RoutePointRepository } from 'src/route-point/route-point.repository';

@Injectable()
export class RouteRepository {
  constructor(
    private readonly drizzleService: DrizzleService,
    private readonly routePointRepository: RoutePointRepository,
    private readonly cdnService: CdnService,
  ) {}

  async getDetailedRouteById(id: number) {
    const [rt] = await this.drizzleService.db
      .select({
        id: route.id,
        name: route.name,
        description: route.description,
        tags: sql<
          Array<string>
        >`COALESCE(array_agg(DISTINCT ${routeTag.tag}) FILTER (WHERE ${routeTag.tag} IS NOT NULL), '{}')`,
        // upvotes: sql<number>`(
        //     SELECT COALESCE(SUM(${routeUpvote.vote}), 0)
        //     FROM ${routeUpvote}
        //     WHERE ${routeUpvote.route} = ${route.id}
        //   )`.mapWith(Number),
        ownerId: route.owner,
        ownerName: user.name,
        images: sql<
          Array<string>
        >`COALESCE(array_agg(DISTINCT ${routeImage.imageUrl}) FILTER (WHERE ${routeImage.imageUrl} IS NOT NULL), '{}')`,
      })
      .from(route)
      .where(eq(route.id, id))
      .leftJoin(routeTag, eq(route.id, routeTag.route))
      .leftJoin(routeImage, eq(route.id, routeImage.route))
      .leftJoin(user, eq(route.owner, user.id))
      .groupBy(route.id, route.name, route.description, route.owner, user.name);

    return rt;
  }

  async getRouteById(id: number): Promise<Route> {
    const [rt] = await this.drizzleService.db
      .select()
      .from(route)
      .where(eq(route.id, id));

    return rt;
  }

  async getAllUserRoutes(userId: number): Promise<Array<Route>> {
    return await this.drizzleService.db
      .select()
      .from(route)
      .where(eq(route.owner, userId));
  }

  async createWithTransaction(
    transaction: PgTransaction<
      NodePgQueryResultHKT,
      typeof schema,
      ExtractTablesWithRelations<typeof schema>
    >,
    values: NewRoute,
  ): Promise<Route> {
    const [createdRoute] = await transaction
      .insert(route)
      .values(values)
      .returning();

    return createdRoute;
  }

  async createTagWithTransaction(
    transaction: PgTransaction<
      NodePgQueryResultHKT,
      typeof schema,
      ExtractTablesWithRelations<typeof schema>
    >,
    values: NewRouteTag,
  ): Promise<RouteTag> {
    const [createdRouteTag] = await transaction
      .insert(routeTag)
      .values(values)
      .returning();

    return createdRouteTag;
  }

  async createRouteImageWithTransaction(
    transaction: PgTransaction<
      NodePgQueryResultHKT,
      typeof schema,
      ExtractTablesWithRelations<typeof schema>
    >,
    values: NewRouteImage,
  ) {
    const createdRouteImage = await transaction
      .insert(routeImage)
      .values(values)
      .returning();

    return createdRouteImage;
  }

  async getResumedRoutes(limit: number = 16384) {
    const routes = await this.drizzleService.db
      .select({
        id: route.id,
        name: route.name,
        description: route.description,
        tags: sql<Array<string>>`array_agg(${routeTag.tag})`,
      })
      .from(route)
      .leftJoin(routeTag, eq(route.id, routeTag.route))
      .leftJoin(routeImage, eq(route.id, routeImage.route))
      .groupBy(route.id, route.name, route.description)
      .orderBy(asc(route.name))
      .limit(limit);

    return await Promise.all(
      routes.map(async (resumedRoute) => {
        const [firstRouteImage] = await this.drizzleService.db
          .select()
          .from(routeImage)
          .where(eq(routeImage.route, resumedRoute.id))
          .orderBy(asc(routeImage.id))
          .limit(1);

        const image = firstRouteImage ? firstRouteImage.imageUrl : null;
        return { ...resumedRoute, image: image };
      }),
    );
  }

  async deleteRouteImage(id: number): Promise<void> {
    const [rtImage] = await this.drizzleService.db
      .select()
      .from(routeImage)
      .where(eq(routeImage.id, id));

    await this.cdnService.deleteFile('routes', rtImage.filePath);

    await this.drizzleService.db
      .delete(routeImage)
      .where(eq(routeImage.id, id));
  }

  async delete(id: number) {
    const [dbRoute] = await this.drizzleService.db
      .select({
        id: route.id,
        routeImageIdList: sql<
          Array<number>
        >`COALESCE(array_agg(DISTINCT ${routeImage.id}), '{}')`,
        routePointIdList: sql<
          Array<number>
        >`COALESCE(array_agg(DISTINCT ${routePoint.id}), '{}')`,
      })
      .from(route)
      .where(eq(route.id, id))
      .leftJoin(routePoint, eq(routePoint.route, route.id))
      .leftJoin(routeImage, eq(routeImage.route, route.id))
      .groupBy(route.id);

    await Promise.all([
      ...dbRoute.routePointIdList.map((routePointId) =>
        this.routePointRepository.deleteRoutePoint(routePointId),
      ),
      ...dbRoute.routeImageIdList.map((routeImageId) =>
        this.deleteRouteImage(routeImageId),
      ),
    ]);

    await this.drizzleService.db.delete(route).where(eq(route.id, id));
  }
}
