import { Module } from '@nestjs/common';
import { CdnModule } from 'src/cdn/cdn.module';
import { DrizzleModule } from 'src/drizzle/drizzle.module';
import { RoutePointRepository } from './route-point.repository';
import { RoutePointService } from './route-point.service';

@Module({
  imports: [DrizzleModule, CdnModule],
  controllers: [],
  providers: [RoutePointService, RoutePointRepository],
  exports: [RoutePointRepository],
})
export class RoutePointModule {}
