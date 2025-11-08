import { Module } from '@nestjs/common';
import { CdnModule } from 'src/cdn/cdn.module';
import { DrizzleModule } from 'src/drizzle/drizzle.module';
import { RoutePointController } from './route-point.controller';
import { RoutePointRepository } from './route-point.repository';
import { RoutePointService } from './route-point.service';

@Module({
  imports: [DrizzleModule, CdnModule],
  controllers: [RoutePointController],
  providers: [RoutePointService, RoutePointRepository],
  exports: [RoutePointRepository],
})
export class RoutePointModule {}
