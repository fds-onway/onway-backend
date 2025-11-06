import { Injectable } from '@nestjs/common';
import { eq, ExtractTablesWithRelations, sql } from 'drizzle-orm';
import { NodePgQueryResultHKT } from 'drizzle-orm/node-postgres';
import { PgTransaction } from 'drizzle-orm/pg-core';
import Fuse from 'fuse.js';
import { DrizzleService } from 'src/drizzle/drizzle.service';
import * as schema from 'src/drizzle/schema';
import {
  NewRoute,
  NewRouteTag,
  route,
  Route,
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
    const [createdRouteTag] = await this.drizzleService.db
      .insert(routeTag)
      .values(values)
      .returning();

    return createdRouteTag;
  }

  async search(query: string) {
    const routes = await this.drizzleService.db
      .select({
        id: route.id,
        name: route.name,
        description: route.description,
        tags: sql<Array<string>>`array_agg${routeTag.tag}`,
      })
      .from(route)
      .innerJoin(schema.routeTag, eq(route.id, routeTag.route))
      .groupBy(route.id, route.name, route.description);

    const fuse = new Fuse(routes, {
      includeScore: true,
      threshold: 0.5,
      keys: [
        { name: 'name', weight: 0.7 },
        { name: 'tags', weight: 0.5 },
        { name: 'description', weight: 0.3 },
      ],
    });

    const results = fuse.search(query);

    return results;
  }
}
