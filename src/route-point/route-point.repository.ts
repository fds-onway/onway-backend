import { Injectable } from '@nestjs/common';
import { eq, ExtractTablesWithRelations, sql } from 'drizzle-orm';
import { NodePgQueryResultHKT } from 'drizzle-orm/node-postgres';
import { PgTransaction } from 'drizzle-orm/pg-core';
import { CdnService } from 'src/cdn/cdn.service';
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
  constructor(
    private readonly drizzleService: DrizzleService,
    private readonly cdnService: CdnService,
  ) {}

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

  async deleteRoutePointImage(id: number): Promise<void> {
    const [rtPointImg] = await this.drizzleService.db
      .select()
      .from(routePointImage)
      .where(eq(routePointImage.id, id));

    await this.cdnService.deleteFile('points', rtPointImg.filePath);

    await this.drizzleService.db
      .delete(routePointImage)
      .where(eq(routePointImage.id, id));
  }

  async deleteRoutePoint(id: number): Promise<void> {
    const [rtPoint] = await this.drizzleService.db
      .select({
        id: routePoint.id,
        imageIdList: sql<Array<number>>`array_agg(${routePointImage.id})`,
      })
      .from(routePoint)
      .where(eq(routePoint.id, id))
      .leftJoin(routePointImage, eq(routePoint.id, routePointImage.routePoint))
      .groupBy(routePoint.id);

    await Promise.all(
      rtPoint.imageIdList.map((imageId) => this.deleteRoutePointImage(imageId)),
    );

    await this.drizzleService.db
      .delete(routePoint)
      .where(eq(routePoint.id, id));
  }
}
