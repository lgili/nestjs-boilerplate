import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import * as config from 'config';
import * as Redis from 'ioredis';
import { RateLimiterRedis } from 'rate-limiter-flexible';

import { AuthController } from 'src/modules/auth/auth.controller';
import { AuthService } from 'src/modules/auth/auth.service';
import { UserRepository } from './user.repository';

const throttleConfig = config.get('throttle.login');
const redisConfig = config.get('queue');
const jwtConfig = config.get('jwt');

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET || jwtConfig.secret,
        signOptions: {
          expiresIn: process.env.JWT_EXPIRES_IN || jwtConfig.expiresIn,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserRepository,
  ],
  exports: [
    AuthService,
  ]
})
export class AuthModule {}
