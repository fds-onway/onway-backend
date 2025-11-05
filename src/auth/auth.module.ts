import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from 'src/user/user.module';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { GoogleStrategy } from './google.strategy';
import { IsAdminGuard } from './is-admin.guard';

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.register({
      global: true,
      secret: process.env.TOKEN_SECRET!,
      signOptions: { expiresIn: '720h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, GoogleStrategy, IsAdminGuard, AuthGuard],
  exports: [IsAdminGuard, AuthGuard],
})
export class AuthModule {}
