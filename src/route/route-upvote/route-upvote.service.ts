import { Injectable } from '@nestjs/common';
import { RouteUpvote } from 'src/drizzle/schema';
import { VoteNotFoundError } from './route-upvote.exceptions';
import { RouteUpvoteRepository } from './route-upvote.repository';

@Injectable()
export class RouteUpvoteService {
  constructor(private readonly routeUpvoteRepository: RouteUpvoteRepository) {}

  async register(
    userId: number,
    routeId: number,
    vote: 1 | -1,
  ): Promise<RouteUpvote> {
    const existingVote = await this.routeUpvoteRepository.getByUser(
      userId,
      routeId,
    );

    if (existingVote) {
      return await this.routeUpvoteRepository.update(userId, routeId, vote);
    }

    return await this.routeUpvoteRepository.create(userId, routeId, vote);
  }

  async delete(userId: number, routeId: number): Promise<void> {
    const existingVote = await this.routeUpvoteRepository.getByUser(
      userId,
      routeId,
    );

    if (!existingVote) {
      throw new VoteNotFoundError();
    }
    await this.routeUpvoteRepository.delete(userId, routeId);
  }
}
