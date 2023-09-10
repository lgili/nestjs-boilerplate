import { Module } from '@nestjs/common';

import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerModule } from '@nestjs/throttler';
import * as config from 'config';
import { WinstonModule } from 'nest-winston';
import {
  AcceptLanguageResolver,
  CookieResolver,
  HeaderResolver,
  I18nModule,
  QueryResolver,
} from 'nestjs-i18n';
import * as path from 'path';
import { join } from 'path';

import { CustomThrottlerGuard } from '@core/guard/custom-throttle.guard';
import { CustomValidationPipe } from '@core/pipes/custom-validation.pipe';
import { I18nExceptionFilterPipe } from '@core/pipes/i18n-exception-filter.pipe';
import { AppController } from 'src/app.controller';
import * as throttleConfig from 'src/config/throttle-config';
import winstonConfig from 'src/config/winston';
import { InfraModule } from './infra/infra.module';
import { AuthModule } from './modules/auth/auth.module';

const appConfig = config.get('app');

@Module({
  imports: [

    WinstonModule.forRoot(winstonConfig),
    ThrottlerModule.forRootAsync({
      useFactory: () => throttleConfig,
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: join(__dirname, '../i18n/'),
        watch: true,
      },
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
      ],
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
      exclude: ['/api*'],
    }),
    InfraModule,
    AuthModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useClass: CustomValidationPipe,
    },
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
    // {
    //   provide: APP_FILTER,
    //   useClass: I18nExceptionFilterPipe
    // }
  ],
  controllers: [AppController],
})
export class AppModule {}
