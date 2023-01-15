import { IUserRepository } from 'src/modules/auth/i-user.repository';
import { UserPrismaRepository } from './user.repository';

export default [
  // Repository
  {
    provide: IUserRepository,
    useClass: UserPrismaRepository,
  },
  // You can add or switch to 'in-memory repository' if needed for a certain data store.
];
