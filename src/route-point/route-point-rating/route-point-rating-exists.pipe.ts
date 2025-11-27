/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  NotFoundException,
  PipeTransform,
} from '@nestjs/common';
import { RoutePointRatingRepository } from './route-point-rating.repository';

@Injectable()
export class RoutePointRatingExistsPipe implements PipeTransform {
  constructor(
    private readonly routePointRatingRepository: RoutePointRatingRepository,
  ) {}

  async transform(value: any, metadata: ArgumentMetadata) {
    if (typeof value !== 'number')
      throw new BadRequestException(
        'O valor fornecido no URI não é um id válido.',
      );

    const route = await this.routePointRatingRepository.getRatingById(value);
    if (!route) {
      throw new NotFoundException(
        'A review de rota fornecida no URI não existe.',
      );
    }

    return value;
  }
}
