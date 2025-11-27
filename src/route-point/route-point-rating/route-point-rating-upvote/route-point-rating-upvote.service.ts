import { Injectable } from '@nestjs/common';
import { RoutePointRatingUpvote } from 'src/drizzle/schema';
import { VoteNotFoundError } from './route-point-rating-upvote.exceptions';
import { RoutePointRatingUpvoteRepository } from './route-point-rating-upvote.repository';

@Injectable()
export class RoutePointRatingUpvoteService {
  constructor(
    private readonly routePointRatingUpvoteRepository: RoutePointRatingUpvoteRepository,
  ) {}

  async register(
    userId: number,
    routeId: number,
    vote: 1 | -1,
  ): Promise<RoutePointRatingUpvote> {
    const existingVote = await this.routePointRatingUpvoteRepository.getByUser(
      userId,
      routeId,
    );

    if (existingVote) {
      return await this.routePointRatingUpvoteRepository.update(
        userId,
        routeId,
        vote,
      );
    }

    return await this.routePointRatingUpvoteRepository.create(
      userId,
      routeId,
      vote,
    );
  }

  async delete(userId: number, routeId: number): Promise<void> {
    const existingVote = await this.routePointRatingUpvoteRepository.getByUser(
      userId,
      routeId,
    );

    if (!existingVote) {
      throw new VoteNotFoundError();
    }
    await this.routePointRatingUpvoteRepository.delete(userId, routeId);
  }
}
