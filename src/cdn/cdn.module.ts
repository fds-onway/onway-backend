import { Module } from '@nestjs/common';
import { CdnService } from './cdn.service';
import { CdnController } from './cdn.controller';

@Module({
  providers: [CdnService],
  exports: [CdnService],
  controllers: [CdnController],
})
export class CdnModule {}
