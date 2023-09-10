import { Module } from '@nestjs/common';
import * as Redis from 'redis';
import * as config from 'config';

import { REDIS } from './redis.constants';

const redisConfig = config.get('queue');

@Module({
  providers: [
    {
      provide: REDIS,
      useValue: Redis.createClient({ port: process.env.REDIS_PORT || redisConfig.port, host:  process.env.REDIS_HOST || redisConfig.host, }),
    },
  ],
  exports: [REDIS],
})
export class RedisModule {}