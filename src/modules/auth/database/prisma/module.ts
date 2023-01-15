import { Module } from '@nestjs/common';
import { PrismaService } from 'src/infra/database/prisma/prisma.service';

import repositoryProviders from './repository-providers';

@Module({
  imports: [],
  providers: [PrismaService, ...repositoryProviders],
  exports: [...repositoryProviders],
})
export class PrismaModule {}
