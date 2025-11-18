import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { DrizzleModule } from 'src/drizzle/drizzle.module';
import { UserModule } from 'src/user/user.module';
import { RoutePointModule } from '../route-point.module';
import { RoutePointUpvoteController } from './route-point-upvote.controller';
import { RoutePointUpvoteRepository } from './route-point-upvote.repository';
import { RoutePointUpvoteService } from './route-point-upvote.service';

@Module({
  imports: [
    DrizzleModule,
    forwardRef(() => RoutePointModule),
    forwardRef(() => UserModule),
    forwardRef(() => AuthModule),
  ],
  controllers: [RoutePointUpvoteController],
  providers: [RoutePointUpvoteService, RoutePointUpvoteRepository],
})
export class RoutePointUpvoteModule {}
