import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { DrizzleModule } from 'src/drizzle/drizzle.module';
import { RoutePointRatingModule } from '../route-point-rating.module';
import { RoutePointRatingUpvoteController } from './route-point-rating-upvote.controller';
import { RoutePointRatingUpvoteRepository } from './route-point-rating-upvote.repository';
import { RoutePointRatingUpvoteService } from './route-point-rating-upvote.service';

@Module({
  imports: [
    DrizzleModule,
    forwardRef(() => AuthModule),
    forwardRef(() => RoutePointRatingModule),
  ],
  controllers: [RoutePointRatingUpvoteController],
  providers: [RoutePointRatingUpvoteService, RoutePointRatingUpvoteRepository],
})
export class RoutePointRatingUpvoteModule {}
