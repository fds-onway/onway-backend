/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import Fuse from 'fuse.js';
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

      await Promise.all(
        body.images.map((routeImg) => {
          return this.routeRepository.createRouteImageWithTransaction(trx, {
            route: createdRoute.id,
            filePath: routeImg.fileName,
            imageUrl: routeImg.imageUrl,
          });
        }),
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

  async search(query: string | null = null) {
    if (query) {
      const routes = await this.routeRepository.getResumedRoutes();

      const fuse = new Fuse(routes, {
        includeScore: false,
        threshold: 0.5,
        keys: [
          { name: 'name', weight: 0.7 },
          { name: 'tags', weight: 0.5 },
          { name: 'description', weight: 0.3 },
        ],
      });

      const results = fuse.search(query);

      return results.map((result) => result.item);
    }
    return null;
  }
}
