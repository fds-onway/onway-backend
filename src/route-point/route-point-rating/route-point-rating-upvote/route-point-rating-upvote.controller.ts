import { Controller } from '@nestjs/common';
import { RoutePointRatingUpvoteService } from './route-point-rating-upvote.service';

@Controller('route-point-rating-upvote')
export class RoutePointRatingUpvoteController {
  constructor(
    private readonly routePointRatingUpvoteService: RoutePointRatingUpvoteService,
  ) {}
}
