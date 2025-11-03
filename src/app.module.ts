import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { DrizzleModule } from './drizzle/drizzle.module';
import { UserModule } from './user/user.module';
import { EmailModule } from './email/email.module';
import { CdnModule } from './cdn/cdn.module';

@Module({
  imports: [DrizzleModule, UserModule, AuthModule, EmailModule, CdnModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
