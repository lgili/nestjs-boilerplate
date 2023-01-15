import { DynamicModule, Global, Module } from '@nestjs/common';

import { InMemoryRepositoryModule } from './in-memory/module';
import { PrismaModule } from './prisma/module';

type RepositoryType = typeof process.env.REPOSITORY_TYPE;

@Global()
@Module({})
export class DatabaseModule {
  static register(repositoryType: RepositoryType): DynamicModule {
    let databaseModule;

    switch (repositoryType) {
      case 'in-memory':
        databaseModule = InMemoryRepositoryModule;
        break;
      case 'prisma':
        databaseModule = PrismaModule;
        break;
      default:
        databaseModule = InMemoryRepositoryModule;
    }

    return {
      module: databaseModule,
    };
  }
}
