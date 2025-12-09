import { Injectable } from '@nestjs/common';
import { RouteProgress } from 'src/drizzle/schema';
import { RoutePointRepository } from 'src/route-point/route-point.repository';
import ProgressDTO from './progress.dto';
import { PointIsNotInTheSameRouteError } from './progress.exceptions';
import { ProgressRepository } from './progress.repository';

@Injectable()
export class ProgressService {
  constructor(
    private readonly progressRepository: ProgressRepository,
    private readonly routePointRepository: RoutePointRepository,
  ) {}

  async listProgress(userId: number) {
    return await this.progressRepository.getAllRoutesWithProgressByUser(userId);
  }

  async saveProgress(
    userId: number,
    routeId: number,
    dto: ProgressDTO,
  ): Promise<RouteProgress> {
    const routePointIds = (
      await this.routePointRepository.getAllPointsInOneRoute(routeId)
    ).map((rp) => rp.id);
    if (!routePointIds.includes(dto.routePointId)) {
      throw new PointIsNotInTheSameRouteError(
        'Esse ponto não pertence a esta rota.',
      );
    }

    const existingProgress = await this.progressRepository.getRouteProgress(
      userId,
      routeId,
    );

    if (typeof existingProgress === 'undefined') {
      return await this.progressRepository.create(
        userId,
        routeId,
        dto.routePointId,
      );
    }

    const lastPoint =
      await this.routePointRepository.getLastRoutePoint(routeId);
    if (lastPoint.id === dto.routePointId)
      await this.progressRepository.setAsCompleted(userId, routeId);
    return await this.progressRepository.editLastPoint(
      userId,
      routeId,
      dto.routePointId,
    );
  }
}
