import { UserEntity } from "./model/user.entity";
import { UserSerializer } from "./model/user.serializer";


export abstract class IUserRepository {
  abstract findById: (id: string) => Promise<UserSerializer>;
  abstract findByEmail: (email: string) => Promise<UserSerializer>;
  abstract findAll: () => Promise<UserSerializer[]>;
  abstract update: (user: UserEntity) => Promise<UserSerializer>;
  abstract create: (user: UserEntity) => Promise<UserSerializer>;
  abstract delete: (id: string) => Promise<void>;
}
