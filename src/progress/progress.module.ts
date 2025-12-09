import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { DrizzleModule } from 'src/drizzle/drizzle.module';
import { RoutePointModule } from 'src/route-point/route-point.module';
import { RouteModule } from 'src/route/route.module';
import { ProgressController } from './progress.controller';
import { ProgressRepository } from './progress.repository';
import { ProgressService } from './progress.service';

@Module({
  imports: [
    DrizzleModule,
    forwardRef(() => RouteModule),
    forwardRef(() => RoutePointModule),
    forwardRef(() => AuthModule),
  ],
  controllers: [ProgressController],
  providers: [ProgressService, ProgressRepository],
  exports: [ProgressRepository],
})
export class ProgressModule {}
