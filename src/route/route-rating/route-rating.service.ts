import { Injectable } from '@nestjs/common';
import { EditRouteRatingDTO, NewRouteRatingDTO } from './route-rating.dto';
import {
  RatingNotFoundError,
  UserAlreadyRatedError,
} from './route-rating.exceptions';
import { RouteRatingRepository } from './route-rating.repository';

@Injectable()
export class RouteRatingService {
  constructor(private readonly routeRatingRepository: RouteRatingRepository) {}

  async describe(routeId: number, userId: number) {
    const rating = await this.routeRatingRepository.getUserRating(
      routeId,
      userId,
    );

    if (typeof rating === 'undefined') {
      throw new RatingNotFoundError(
        'Não foi encontrado uma review deste usuario nesta rota',
      );
    }
  }

  async create(routeId: number, userId: number, dto: NewRouteRatingDTO) {
    const rating = await this.routeRatingRepository.getUserRating(
      routeId,
      userId,
    );
    if (typeof rating !== 'undefined')
      throw new UserAlreadyRatedError(
        'Esse usuário já fez uma review nesta rota',
      );
    return await this.routeRatingRepository.create(routeId, userId, dto);
  }

  async edit(routeId: number, userId: number, dto: EditRouteRatingDTO) {
    const rating = await this.routeRatingRepository.getUserRating(
      routeId,
      userId,
    );

    if (typeof rating === 'undefined') {
      throw new RatingNotFoundError(
        'Não foi encontrado uma review deste usuario nesta rota',
      );
    }

    await this.routeRatingRepository.edit(rating.id, dto);
  }

  async delete(routeId: number, userId: number) {
    const rating = await this.routeRatingRepository.getUserRating(
      routeId,
      userId,
    );

    if (typeof rating === 'undefined') {
      throw new RatingNotFoundError(
        'Não foi encontrado uma review deste usuario nesta rota',
      );
    }

    await this.routeRatingRepository.delete(rating.id);
  }
}
