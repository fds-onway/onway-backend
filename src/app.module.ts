import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { CdnModule } from './cdn/cdn.module';
import { DrizzleModule } from './drizzle/drizzle.module';
import { EmailModule } from './email/email.module';
import { RouteModule } from './route/route.module';
import { UserModule } from './user/user.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ProgressModule } from './progress/progress.module';

@Module({
  imports: [
    DrizzleModule,
    UserModule,
    AuthModule,
    EmailModule,
    CdnModule,
    RouteModule,
    DashboardModule,
    ProgressModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
