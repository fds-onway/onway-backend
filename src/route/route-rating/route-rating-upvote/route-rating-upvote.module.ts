import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { DrizzleModule } from 'src/drizzle/drizzle.module';
import { UserModule } from 'src/user/user.module';
import { RouteRatingModule } from '../route-rating.module';
import { RouteRatingUpvoteController } from './route-rating-upvote.controller';
import { RouteRatingUpvoteRepository } from './route-rating-upvote.repository';
import { RouteRatingUpvoteService } from './route-rating-upvote.service';

@Module({
  imports: [
    DrizzleModule,
    forwardRef(() => UserModule),
    forwardRef(() => AuthModule),
    forwardRef(() => RouteRatingModule),
  ],
  controllers: [RouteRatingUpvoteController],
  providers: [RouteRatingUpvoteService, RouteRatingUpvoteRepository],
})
export class RouteRatingUpvoteModule {}
