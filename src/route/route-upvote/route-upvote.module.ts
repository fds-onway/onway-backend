import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { DrizzleModule } from 'src/drizzle/drizzle.module';
import { UserModule } from 'src/user/user.module';
import { RouteModule } from '../route.module';
import { RouteUpvoteController } from './route-upvote.controller';
import { RouteUpvoteRepository } from './route-upvote.repository';
import { RouteUpvoteService } from './route-upvote.service';

@Module({
  imports: [
    DrizzleModule,
    forwardRef(() => RouteModule),
    forwardRef(() => UserModule),
    forwardRef(() => AuthModule),
  ],
  controllers: [RouteUpvoteController],
  providers: [RouteUpvoteService, RouteUpvoteRepository],
})
export class RouteUpvoteModule {}
