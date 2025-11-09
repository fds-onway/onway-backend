import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from 'src/auth/auth.module';
import { DrizzleModule } from 'src/drizzle/drizzle.module';
import { EmailModule } from 'src/email/email.module';
import { RouteModule } from 'src/route/route.module';
import { SelfUserGuard } from './self-user.guard';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';

@Module({
  imports: [
    DrizzleModule,
    EmailModule,
    forwardRef(() => RouteModule),
    JwtModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [UserController],
  providers: [UserService, UserRepository, SelfUserGuard],
  exports: [UserService, UserRepository, SelfUserGuard],
})
export class UserModule {}
