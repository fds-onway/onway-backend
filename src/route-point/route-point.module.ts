import { Module } from '@nestjs/common';
import { CdnModule } from 'src/cdn/cdn.module';
import { DrizzleModule } from 'src/drizzle/drizzle.module';
import { RoutePointController } from './route-point.controller';
import { RoutePointRepository } from './route-point.repository';
import { RoutePointService } from './route-point.service';
import { RoutePointUpvoteModule } from './route-point-upvote/route-point-upvote.module';

@Module({
  imports: [DrizzleModule, CdnModule, RoutePointUpvoteModule],
  controllers: [RoutePointController],
  providers: [RoutePointService, RoutePointRepository],
  exports: [RoutePointRepository],
})
export class RoutePointModule {}
