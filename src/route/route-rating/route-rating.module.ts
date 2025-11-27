import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { DrizzleModule } from 'src/drizzle/drizzle.module';
import { RouteModule } from '../route.module';
import { RouteRatingUpvoteModule } from './route-rating-upvote/route-rating-upvote.module';
import { RouteRatingController } from './route-rating.controller';
import { RouteRatingRepository } from './route-rating.repository';
import { RouteRatingService } from './route-rating.service';

@Module({
  imports: [
    DrizzleModule,
    forwardRef(() => RouteModule),
    forwardRef(() => AuthModule),
    RouteRatingUpvoteModule,
  ],
  controllers: [RouteRatingController],
  providers: [RouteRatingService, RouteRatingRepository],
  exports: [RouteRatingRepository],
})
export class RouteRatingModule {}
