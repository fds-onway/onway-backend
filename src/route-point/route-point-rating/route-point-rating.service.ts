import { Injectable } from '@nestjs/common';
import {
  EditRoutePointRatingDTO,
  NewRoutePointRatingDTO,
} from './route-point-rating.dto';
import {
  RatingNotFoundError,
  UserAlreadyRatedError,
} from './route-point-rating.exceptions';
import { RoutePointRatingRepository } from './route-point-rating.repository';

@Injectable()
export class RoutePointRatingService {
  constructor(
    private readonly routePointRatingRepository: RoutePointRatingRepository,
  ) {}

  async describe(routePointId: number, userId: number) {
    const rating = await this.routePointRatingRepository.getUserRating(
      routePointId,
      userId,
    );

    if (typeof rating === 'undefined') {
      throw new RatingNotFoundError(
        'Não foi encontrado uma review deste usuario neste ponto de rota',
      );
    }
  }

  async create(
    routePointId: number,
    userId: number,
    dto: NewRoutePointRatingDTO,
  ) {
    const rating = await this.routePointRatingRepository.getUserRating(
      routePointId,
      userId,
    );
    if (typeof rating !== 'undefined')
      throw new UserAlreadyRatedError(
        'Esse usuário já fez uma review nesta rota',
      );
    return await this.routePointRatingRepository.create(
      routePointId,
      userId,
      dto,
    );
  }

  async edit(
    routePointId: number,
    userId: number,
    dto: EditRoutePointRatingDTO,
  ) {
    const rating = await this.routePointRatingRepository.getUserRating(
      routePointId,
      userId,
    );

    if (typeof rating === 'undefined') {
      throw new RatingNotFoundError(
        'Não foi encontrado uma review deste usuario neste ponto de rota',
      );
    }

    await this.routePointRatingRepository.edit(rating.id, dto);
  }

  async delete(routePointId: number, userId: number) {
    const rating = await this.routePointRatingRepository.getUserRating(
      routePointId,
      userId,
    );

    if (typeof rating === 'undefined') {
      throw new RatingNotFoundError(
        'Não foi encontrado uma review deste usuario neste ponto de rota',
      );
    }

    await this.routePointRatingRepository.delete(rating.id);
  }
}
