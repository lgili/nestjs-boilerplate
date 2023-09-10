import { BaseRepository } from '@core/repository/base.repository';
import { PrismaService } from '@infra/database/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { UserEntity } from './entity/user.entity';

@Injectable()
export class UserRepository extends BaseRepository<UserEntity> {
  constructor(private prisma: PrismaService) {
    super('user', prisma);
  }
}
