/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import Fuse from 'fuse.js';
import { DrizzleService } from 'src/drizzle/drizzle.service';
import { Route } from 'src/drizzle/schema';
import { RoutePointRepository } from 'src/route-point/route-point.repository';
import { RouteRatingRepository } from './route-rating/route-rating.repository';
import { CreateRouteDTO, UpdateRouteDTO } from './route.dto';
import { RouteRepository } from './route.repository';

@Injectable()
export class RouteService {
  constructor(
    private readonly drizzleService: DrizzleService,
    private readonly routePointRepository: RoutePointRepository,
    private readonly routeRepository: RouteRepository,
    private readonly routeRatingRepository: RouteRatingRepository,
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
        const { images: _, id: __, ...routePointToCreate } = routePoint;
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

  async edit(
    routeId: number,
    body: UpdateRouteDTO,
    request: Request,
  ): Promise<Route> {
    const userId = request.headers['user-id'];

    const route = await this.drizzleService.db.transaction(async (trx) => {
      if (body.name || body.description) {
        await this.routeRepository.editWithTransaction(trx, routeId, body);
      }

      if (body.images) {
        const currentImages =
          await this.routeRepository.getImagesByRouteId(routeId);
        const currentImageUrls = currentImages.map((img) => img.imageUrl);

        const incomingUrls = body.images.map((img) => img.imageUrl);

        const imagesToDelete = currentImages.filter(
          (img) => !incomingUrls.includes(img.imageUrl),
        );
        await Promise.all(
          imagesToDelete.map((img) =>
            this.routeRepository.deleteRouteImageWithTransaction(trx, img.id),
          ),
        );

        const imagesToCreate = body.images.filter(
          (img) => !currentImageUrls.includes(img.imageUrl),
        );
        await Promise.all(
          imagesToCreate.map((img) =>
            this.routeRepository.createRouteImageWithTransaction(trx, {
              route: routeId,
              imageUrl: img.imageUrl,
              filePath: img.fileName,
            }),
          ),
        );
      }

      if (body.points) {
        const currentPoints =
          await this.routePointRepository.getAllPointsInOneRoute(routeId);

        const currentPointsIds = currentPoints.map((point) => point.id);
        const incomingIds = body.points
          .filter((point) => point.id !== undefined)
          .map((point) => point.id);

        const pointsToDelete = currentPointsIds.filter(
          (id) => !incomingIds.includes(id),
        );
        if (pointsToDelete.length > 0) {
          await Promise.all(
            pointsToDelete.map((pointId) =>
              this.routePointRepository.deleteRoutePointWithTransaction(
                trx,
                pointId,
              ),
            ),
          );
        }

        await Promise.all(
          body.points.map(async (pointDTO, index) => {
            if (pointDTO.id) {
              await this.routePointRepository.editRoutePointWithTransaction(
                trx,
                pointDTO.id,
                { ...pointDTO, sequence: index },
              );
            } else {
              const createdRoutePoint =
                await this.routePointRepository.createWithTransaction(trx, {
                  ...pointDTO,
                  route: routeId,
                  sequence: index,
                });

              if (pointDTO.images && pointDTO.images.length > 0) {
                await Promise.all(
                  pointDTO.images.map(async (routePointImage) => {
                    await this.routePointRepository.createRoutePointImageWithTransaction(
                      trx,
                      {
                        routePoint: createdRoutePoint.id,
                        imageUrl: routePointImage.imageUrl,
                        filePath: routePointImage.fileName,
                      },
                    );
                  }),
                );
              }
            }
          }),
        );
      }

      if (body.tags) {
        const existingTags =
          await this.routeRepository.getAllTagsInOneRoute(routeId);

        const tagsToDelete = existingTags
          .filter((existingTag) => !body.tags!.includes(existingTag.tag))
          .map((tagToDelete) => tagToDelete.id);

        const tagsToCreate = body.tags.filter(
          (tag) =>
            !existingTags.map((existingTag) => existingTag.tag).includes(tag),
        );

        //Deletar tags que estão na rota mas não estão no DTO
        await Promise.all(
          tagsToDelete.map(
            async (tagToDelete) =>
              await this.routeRepository.deleteTagWithTransaction(
                trx,
                tagToDelete,
              ),
          ),
        );

        //Cria as tags que não estão na rota mas estão no DTO
        await Promise.all(
          tagsToCreate.map(
            async (tag) =>
              await this.routeRepository.createTagWithTransaction(trx, {
                tag,
                route: routeId,
              }),
          ),
        );
      }

      return await this.routeRepository.getRouteById(routeId);
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
    return await this.routeRepository.getResumedRoutes(15);
  }

  async describe(id: number) {
    const route = await this.routeRepository.getDetailedRouteById(id);

    const routeWithPointsAndReviews = {
      ...route,
      points: await this.routePointRepository.getAllPointsInOneRoute(route.id),
      reviews: await this.routeRatingRepository.getAllReviewsInOneRoute(
        route.id,
      ),
    };

    return routeWithPointsAndReviews;
  }

  async delete(id: number): Promise<void> {
    await this.routeRepository.delete(id);
  }
}
