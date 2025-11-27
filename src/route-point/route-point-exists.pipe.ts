/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  NotFoundException,
  PipeTransform,
} from '@nestjs/common';
import { RoutePointRepository } from './route-point.repository';

@Injectable()
export class RoutePointExistsPipe implements PipeTransform {
  constructor(private readonly routePointRepository: RoutePointRepository) {}

  async transform(value: any, metadata: ArgumentMetadata) {
    if (typeof value !== 'number')
      throw new BadRequestException(
        'O valor fornecido no URI não é um id válido.',
      );

    const route = await this.routePointRepository.getById(value);
    if (!route) {
      throw new NotFoundException(
        'O ponto de rota fornecido no URI não existe.',
      );
    }
    return value;
  }
}
