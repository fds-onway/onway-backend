/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { DrizzleService } from 'src/drizzle/drizzle.service';
import { Route } from 'src/drizzle/schema';
import { RoutePointRepository } from 'src/route-point/route-point.repository';
import { CreateRouteDTO } from './route.dto';
import { RouteRepository } from './route.repository';

@Injectable()
export class RouteService {
  constructor(
    private readonly drizzleService: DrizzleService,
    private readonly routePointRepository: RoutePointRepository,
    private readonly routeRepository: RouteRepository,
  ) {}

  async create(body: CreateRouteDTO, request: Request): Promise<Route> {
    const userId = request.headers['user-id'];

    const route = await this.drizzleService.db.transaction(async (trx) => {
      const createdRoute = await this.routeRepository.createWithTransaction(
        trx,
        {
          name: body.name,
          description: body.description,
          owner: parseInt(userId! as string),
        },
      );

      let seq = 0;
      for (const routePoint of body.points) {
        const { images: _, ...routePointToCreate } = routePoint;
        const createdRoutePoint =
          await this.routePointRepository.createWithTransaction(trx, {
            ...routePointToCreate,
            route: createdRoute.id,
            sequence: seq,
          });

        for (const routePointImage of routePoint.images) {
          await this.routePointRepository.createRoutePointImageWithTransaction(
            trx,
            {
              routePoint: createdRoutePoint.id,
              imageUrl: routePointImage.imageUrl,
              filePath: routePointImage.fileName,
            },
          );
        }

        seq++;
      }

      const tagRoutes = body.tags.map((tag) => {
        return this.routeRepository.createTagWithTransaction(trx, {
          route: createdRoute.id,
          tag,
        });
      });

      await Promise.all(tagRoutes);

      return createdRoute;
    });

    return route;
  }
}
