import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { CdnModule } from 'src/cdn/cdn.module';
import { DrizzleModule } from 'src/drizzle/drizzle.module';
import { RoutePointModule } from 'src/route-point/route-point.module';
import { RouteController } from './route.controller';
import { RouteRepository } from './route.repository';
import { RouteService } from './route.service';
import { RouteUpvoteModule } from './route-upvote/route-upvote.module';

@Module({
  imports: [
    RoutePointModule,
    DrizzleModule,
    forwardRef(() => AuthModule),
    CdnModule,
    RouteUpvoteModule,
  ],
  controllers: [RouteController],
  providers: [RouteService, RouteRepository],
  exports: [RouteRepository],
})
export class RouteModule {}
