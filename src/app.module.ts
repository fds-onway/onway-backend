import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { DrizzleModule } from './drizzle/drizzle.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [DrizzleModule, UserModule, AuthModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
