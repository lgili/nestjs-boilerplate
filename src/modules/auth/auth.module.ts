import { Module } from '@nestjs/common';

import * as config from 'config';
import * as Redis from 'ioredis';

import { AuthController } from 'src/modules/auth/auth.controller';
import { AuthService } from 'src/modules/auth/auth.service';
import { DatabaseModule } from './database/database.module';


const throttleConfig = config.get('throttle.login');
const redisConfig = config.get('queue');

// const LoginThrottleFactory = {
//   provide: 'LOGIN_THROTTLE',
//   useFactory: () => {
//     const redisClient = new Redis({
//       enableOfflineQueue: false,
//       host: process.env.REDIS_HOST || redisConfig.host,
//       port: process.env.REDIS_PORT || redisConfig.port,
//       password: process.env.REDIS_PASSWORD || redisConfig.password
//     });

//     return new RateLimiterRedis({
//       storeClient: redisClient,
//       keyPrefix: throttleConfig.prefix,
//       points: throttleConfig.limit,
//       duration: 60 * 60 * 24 * 30, // Store number for 30 days since first fail
//       blockDuration: throttleConfig.blockDuration
//     });
//   }
// };

@Module({
  imports: [    
    DatabaseModule.register(process.env.REPOSITORY_TYPE)
  ],
  controllers: [AuthController],
  providers: [
    AuthService,    
  ],
  exports: [
    AuthService,    
  ]
})
export class AuthModule {}
