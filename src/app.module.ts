import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { CdnModule } from './cdn/cdn.module';
import { DrizzleModule } from './drizzle/drizzle.module';
import { EmailModule } from './email/email.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [DrizzleModule, UserModule, AuthModule, EmailModule, CdnModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
