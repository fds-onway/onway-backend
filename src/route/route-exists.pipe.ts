/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  NotFoundException,
  PipeTransform,
} from '@nestjs/common';
import { RouteRepository } from './route.repository';

@Injectable()
export class RouteExistsPipe implements PipeTransform {
  constructor(private readonly routeRepository: RouteRepository) {}

  async transform(value: any, metadata: ArgumentMetadata): Promise<number> {
    if (typeof value !== 'number')
      throw new BadRequestException(
        'O valor fornecido no URI não é um id válido.',
      );

    const route = await this.routeRepository.getRouteById(value);
    if (!route) {
      throw new NotFoundException('A rota fornecida no URI não existe.');
    }
    return value;
  }
}
