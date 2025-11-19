/* eslint-disable @typescript-eslint/no-unused-vars */
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
  routePointRating,
} from 'src/drizzle/schema';
import { RoutePointRatingRepository } from './route-point-rating/route-point-rating.repository';

@Injectable()
export class RoutePointRepository {
  constructor(
    private readonly drizzleService: DrizzleService,
    private readonly cdnService: CdnService,
    private readonly routePointRatingRepository: RoutePointRatingRepository,
  ) {}

  async getById(id: number): Promise<RoutePoint> {
    const [rtPoint] = await this.drizzleService.db
      .select()
      .from(routePoint)
      .where(eq(routePoint.id, id));
    return rtPoint;
  }

  async getAllPointsInOneRoute(routeId: number) {
    const routePoints = await this.drizzleService.db
      .select({
        id: routePoint.id,
        name: routePoint.name,
        description: routePoint.description,
        type: routePoint.type,
        rating: sql<number>`(
            SELECT COALESCE(SUM(${routePointRating.review}), 0)
            FROM ${routePointRating}
            WHERE ${routePointRating.routePoint} = ${routePoint.id}
          )`.mapWith(Number),
        ratingCount: sql<number>`(
            SELECT COALESCE(COUNT(${routePointRating.review}), 0)
            FROM ${routePointRating}
            WHERE ${routePointRating.routePoint} = ${routePoint.id}
          )`.mapWith(Number),
        latitude: routePoint.latitude,
        longitude: routePoint.longitude,
        sequence: routePoint.sequence,
        images: sql<
          Array<string>
        >`COALESCE(array_agg(DISTINCT ${routePointImage.imageUrl}) FILTER (WHERE ${routePointImage.imageUrl} IS NOT NULL), '{}')`,
      })
      .from(routePoint)
      .leftJoin(routePointImage, eq(routePointImage.routePoint, routePoint.id))
      .where(eq(routePoint.route, routeId))
      .groupBy(
        routePoint.id,
        routePoint.name,
        routePoint.description,
        routePoint.type,
        routePoint.latitude,
        routePoint.longitude,
      )
      .orderBy(routePoint.sequence);

    return Promise.all(
      routePoints.map(async (routePoint) => {
        return {
          ...routePoint,
          reviews:
            await this.routePointRatingRepository.getAllReviewsInOneRoutePoint(
              routePoint.id,
            ),
        };
      }),
    );
  }

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

  async deleteRoutePointImageWithTransaction(
    transaction: PgTransaction<
      NodePgQueryResultHKT,
      typeof schema,
      ExtractTablesWithRelations<typeof schema>
    >,
    id: number,
  ): Promise<void> {
    const [rtPointImg] = await transaction
      .select()
      .from(routePointImage)
      .where(eq(routePointImage.id, id));

    await this.cdnService.deleteFile('points', rtPointImg.filePath);

    await transaction.delete(routePointImage).where(eq(routePointImage.id, id));
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

  async deleteRoutePointWithTransaction(
    transaction: PgTransaction<
      NodePgQueryResultHKT,
      typeof schema,
      ExtractTablesWithRelations<typeof schema>
    >,
    id: number,
  ): Promise<void> {
    const [rtPoint] = await transaction
      .select({
        id: routePoint.id,
        imageIdList: sql<Array<number>>`array_agg(${routePointImage.id})`,
      })
      .from(routePoint)
      .where(eq(routePoint.id, id))
      .leftJoin(routePointImage, eq(routePoint.id, routePointImage.routePoint))
      .groupBy(routePoint.id);

    await Promise.all(
      rtPoint.imageIdList.map((imageId) =>
        this.deleteRoutePointImageWithTransaction(transaction, imageId),
      ),
    );

    await transaction.delete(routePoint).where(eq(routePoint.id, id));
  }

  async editRoutePointWithTransaction(
    transaction: PgTransaction<
      NodePgQueryResultHKT,
      typeof schema,
      ExtractTablesWithRelations<typeof schema>
    >,
    id: number,
    dto: Partial<RoutePoint>,
  ): Promise<RoutePoint> {
    const { id: _, ...setDto } = dto;
    const [editedRoutePoint] = await transaction
      .update(routePoint)
      .set(setDto)
      .where(eq(routePoint.id, id))
      .returning();

    return editedRoutePoint;
  }

  async getImagesByPointId(pointId: number) {
    return await this.drizzleService.db
      .select()
      .from(routePointImage)
      .where(eq(routePointImage.routePoint, pointId));
  }
}
