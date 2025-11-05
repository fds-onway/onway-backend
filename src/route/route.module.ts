import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { DrizzleModule } from 'src/drizzle/drizzle.module';
import { RoutePointModule } from 'src/route-point/route-point.module';
import { RouteController } from './route.controller';
import { RouteRepository } from './route.repository';
import { RouteService } from './route.service';

@Module({
  imports: [RoutePointModule, DrizzleModule, AuthModule],
  controllers: [RouteController],
  providers: [RouteService, RouteRepository],
})
export class RouteModule {}
