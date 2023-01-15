import { Injectable } from '@nestjs/common';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { IUserRepository } from 'src/modules/auth/i-user.repository';
import { UserEntity } from 'src/modules/auth/model/user.entity';
import { UserSerializer } from '../../model/user.serializer';

@Injectable()
export class UserInMemoryRepository implements IUserRepository {
  private users: UserEntity[] = [];

  async findById(id: string): Promise<UserSerializer> {
    const userIndex = this.users.findIndex((userItem) => {
      return userItem.id === id;
    });

    return this.toDomain(this.users[userIndex]);
  }

  async findByEmail(email: string): Promise<UserSerializer> {
    const userIndex = this.users.findIndex((userItem) => {
      return userItem.email === email;
    });

    return this.toDomain(this.users[userIndex]);
  }

  async findAll(): Promise<UserSerializer[]> {
    return this.transformMany(this.users);
  }

  async create(user: UserEntity): Promise<UserSerializer> {
    this.users.push(user);

    return this.toDomain(user);
  }

  async update(user: UserEntity): Promise<UserSerializer> {
    const userIndex = this.users.findIndex((userItem) => {
      return userItem.id === user.id;
    });

    this.users[userIndex] = user;
    return this.toDomain(user);
  }

  async delete(id: string): Promise<void> {
    const userIndex = this.users.findIndex((userItem) => {
      return userItem.id === id;
    });

    this.users.splice(userIndex, 1);
  }

  /**
   * toDomain user
   * @param model
   * @param transformOption
   */
  toDomain(model: UserEntity, transformOption = {}): UserSerializer {
    return plainToInstance(
      UserSerializer,
      instanceToPlain(model, transformOption),
      transformOption
    );
  }

  
  /**
   * toDomain users collection
   * @param models
   * @param transformOption
   */
  transformMany(models: UserEntity[], transformOption = {}): UserSerializer[] {
    return models.map((model) => this.toDomain(model, transformOption));
  }
}
