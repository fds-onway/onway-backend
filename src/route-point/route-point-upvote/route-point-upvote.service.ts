import { Injectable } from '@nestjs/common';
import { RoutePointUpvote } from 'src/drizzle/schema';
import { VoteNotFoundError } from './route-point-upvote.exceptions';
import { RoutePointUpvoteRepository } from './route-point-upvote.repository';

@Injectable()
export class RoutePointUpvoteService {
  constructor(
    private readonly routePointUpvoteRepository: RoutePointUpvoteRepository,
  ) {}

  async register(
    userId: number,
    routePointId: number,
    vote: 1 | -1,
  ): Promise<RoutePointUpvote> {
    const existingVote = await this.routePointUpvoteRepository.getByUser(
      userId,
      routePointId,
    );

    if (existingVote) {
      return await this.routePointUpvoteRepository.update(
        userId,
        routePointId,
        vote,
      );
    }

    return await this.routePointUpvoteRepository.create(
      userId,
      routePointId,
      vote,
    );
  }

  async delete(userId: number, routePointId: number): Promise<void> {
    const existingVote = await this.routePointUpvoteRepository.getByUser(
      userId,
      routePointId,
    );

    if (!existingVote) {
      throw new VoteNotFoundError();
    }
    await this.routePointUpvoteRepository.delete(userId, routePointId);
  }
}
