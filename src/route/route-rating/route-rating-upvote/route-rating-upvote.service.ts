import { Injectable } from '@nestjs/common';
import { RouteRatingUpvote } from 'src/drizzle/schema';
import { VoteNotFoundError } from './route-rating-upvote.exceptions';
import { RouteRatingUpvoteRepository } from './route-rating-upvote.repository';

@Injectable()
export class RouteRatingUpvoteService {
  constructor(
    private readonly routeRatingUpvoteRepository: RouteRatingUpvoteRepository,
  ) {}

  async register(
    userId: number,
    routeId: number,
    vote: 1 | -1,
  ): Promise<RouteRatingUpvote> {
    const existingVote = await this.routeRatingUpvoteRepository.getByUser(
      userId,
      routeId,
    );

    if (existingVote) {
      return await this.routeRatingUpvoteRepository.update(
        userId,
        routeId,
        vote,
      );
    }

    return await this.routeRatingUpvoteRepository.create(userId, routeId, vote);
  }

  async delete(userId: number, routeId: number): Promise<void> {
    const existingVote = await this.routeRatingUpvoteRepository.getByUser(
      userId,
      routeId,
    );

    if (!existingVote) {
      throw new VoteNotFoundError();
    }
    await this.routeRatingUpvoteRepository.delete(userId, routeId);
  }
}
