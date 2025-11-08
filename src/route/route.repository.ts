import { Injectable } from '@nestjs/common';
import { asc, eq, ExtractTablesWithRelations, sql } from 'drizzle-orm';
import { NodePgQueryResultHKT } from 'drizzle-orm/node-postgres';
import { PgTransaction } from 'drizzle-orm/pg-core';
import { DrizzleService } from 'src/drizzle/drizzle.service';
import * as schema from 'src/drizzle/schema';
import {
  NewRoute,
  NewRouteImage,
  NewRouteTag,
  route,
  Route,
  routeImage,
  RouteTag,
  routeTag,
} from 'src/drizzle/schema';

@Injectable()
export class RouteRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

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

  async getResumedRoutes() {
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
      .groupBy(route.id, route.name, route.description);

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
}
