import { Injectable } from '@nestjs/common';
import { ExtractTablesWithRelations } from 'drizzle-orm';
import { NodePgQueryResultHKT } from 'drizzle-orm/node-postgres';
import { PgTransaction } from 'drizzle-orm/pg-core';
import { DrizzleService } from 'src/drizzle/drizzle.service';
import * as schema from 'src/drizzle/schema';
import {
  NewRoutePoint,
  NewRoutePointImage,
  RoutePoint,
  routePoint,
  RoutePointImage,
  routePointImage,
} from 'src/drizzle/schema';

@Injectable()
export class RoutePointRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async createWithTransaction(
    transaction: PgTransaction<
      NodePgQueryResultHKT,
      typeof schema,
      ExtractTablesWithRelations<typeof schema>
    >,
    values: NewRoutePoint,
  ): Promise<RoutePoint> {
    const [createdRoutePoint] = await transaction
      .insert(routePoint)
      .values(values)
      .returning();

    return createdRoutePoint;
  }

  async createRoutePointImageWithTransaction(
    transaction: PgTransaction<
      NodePgQueryResultHKT,
      typeof schema,
      ExtractTablesWithRelations<typeof schema>
    >,
    values: NewRoutePointImage,
  ): Promise<RoutePointImage> {
    const [createdRoutePointImage] = await transaction
      .insert(routePointImage)
      .values(values)
      .returning();

    return createdRoutePointImage;
  }
}
