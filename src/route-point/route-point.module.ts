import { Module } from '@nestjs/common';
import { CdnModule } from 'src/cdn/cdn.module';
import { DrizzleModule } from 'src/drizzle/drizzle.module';
import { RoutePointRepository } from './route-point.repository';
import { RoutePointService } from './route-point.service';
import { RoutePointRatingModule } from './route-point-rating/route-point-rating.module';

@Module({
  imports: [DrizzleModule, CdnModule, RoutePointRatingModule],
  controllers: [],
  providers: [RoutePointService, RoutePointRepository],
  exports: [RoutePointRepository],
})
export class RoutePointModule {}
