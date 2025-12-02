import { Injectable } from '@nestjs/common';
import { ProgressRepository } from 'src/progress/progress.repository';
import { RouteRepository } from 'src/route/route.repository';
import { UserRepository } from 'src/user/user.repository';

@Injectable()
export class DashboardService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly routeRepository: RouteRepository,
    private readonly progressRepository: ProgressRepository,
  ) {}

  async currentUserCount() {
    return await this.userRepository.getUserCount();
  }

  async currentRouteCount() {
    return await this.routeRepository.getRouteCount();
  }

  async currentRouteProgressCount() {
    return await this.progressRepository.getTotalProgressingRoutes();
  }

  async currentCompletedRoutesCount() {
    return await this.progressRepository.getTotalCompletedRoutes();
  }
}
