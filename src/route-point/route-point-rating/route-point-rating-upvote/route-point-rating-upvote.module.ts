import { Module } from '@nestjs/common';
import { RoutePointRatingUpvoteService } from './route-point-rating-upvote.service';
import { RoutePointRatingUpvoteController } from './route-point-rating-upvote.controller';

@Module({
  controllers: [RoutePointRatingUpvoteController],
  providers: [RoutePointRatingUpvoteService],
})
export class RoutePointRatingUpvoteModule {}
