import { Module } from '@nestjs/common';

import { ThrottlerModule } from '@nestjs/throttler';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import * as path from 'path';
import * as config from 'config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import {
  CookieResolver,
  HeaderResolver,
  I18nJsonParser,
  I18nModule,
  QueryResolver
} from 'nestjs-i18n';
import { WinstonModule } from 'nest-winston';


import * as throttleConfig from 'src/config/throttle-config';
import { I18nExceptionFilterPipe } from 'src/common/pipes/i18n-exception-filter.pipe';
import { CustomValidationPipe } from 'src/common/pipes/custom-validation.pipe';
import { CustomThrottlerGuard } from 'src/common/guard/custom-throttle.guard';
import { AppController } from 'src/app.controller';
import winstonConfig from 'src/config/winston';
import { InfraModule } from './infra/infra.module';
import { AuthModule } from './modules/auth/auth.module';

const appConfig = config.get('app');

@Module({
  imports: [
    InfraModule,
    AuthModule,
    WinstonModule.forRoot(winstonConfig),
    ThrottlerModule.forRootAsync({
      useFactory: () => throttleConfig
    }),    
    // I18nModule.forRootAsync({
    //   useFactory: () => ({
    //     fallbackLanguage: appConfig.fallbackLanguage,
    //     parserOptions: {
    //       path: path.join(__dirname, '/i18n/'),
    //       watch: true
    //     }
    //   }),
    //   parser: I18nJsonParser,
    //   resolvers: [
    //     {
    //       use: QueryResolver,
    //       options: ['lang', 'locale', 'l']
    //     },
    //     new HeaderResolver(['x-custom-lang']),
    //     new CookieResolver(['lang', 'locale', 'l'])
    //   ]
    // }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      exclude: ['/api*']
    }),
    
  ],
  providers: [
    {
      provide: APP_PIPE,
      useClass: CustomValidationPipe
    },
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard
    },
    // {
    //   provide: APP_FILTER,
    //   useClass: I18nExceptionFilterPipe
    // }
  ],
  controllers: [AppController]
})
export class AppModule {}