import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { DrizzleModule } from 'src/drizzle/drizzle.module';
import { RoutePointRatingUpvoteModule } from './route-point-rating-upvote/route-point-rating-upvote.module';
import { RoutePointRatingController } from './route-point-rating.controller';
import { RoutePointRatingRepository } from './route-point-rating.repository';
import { RoutePointRatingService } from './route-point-rating.service';

@Module({
  controllers: [RoutePointRatingController],
  providers: [RoutePointRatingService, RoutePointRatingRepository],
  imports: [
    RoutePointRatingUpvoteModule,
    DrizzleModule,
    forwardRef(() => AuthModule),
  ],
  exports: [RoutePointRatingRepository],
})
export class RoutePointRatingModule {}
