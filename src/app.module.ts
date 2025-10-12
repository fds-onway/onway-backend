import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { DrizzleModule } from './drizzle/drizzle.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [DrizzleModule, UserModule, AuthModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
