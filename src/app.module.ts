import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { DrizzleModule } from './drizzle/drizzle.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    DrizzleModule,
    UserModule,
    AuthModule,
    JwtModule.register({ secret: process.env.TOKEN_SECRET! }),
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
