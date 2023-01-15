import { Global, Module } from '@nestjs/common';

import { PrismaModule } from './database/prisma.module';
import { RedisModule } from './redis';

@Global()
@Module({
  imports: [PrismaModule, RedisModule],
  providers: [RedisModule],
  exports: [RedisModule],
})
export class InfraModule {}
