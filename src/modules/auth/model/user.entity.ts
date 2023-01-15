import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { UserStatusEnum } from '../user-status.enum';


export class UserEntity {
  @Expose()
  id: string;
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  username: string;
  
  @ApiProperty()
  @Expose()
  email: string;
  @Exclude()
  password: string;
  @Expose()
  is_confirmed?: boolean;
  @Expose()
  @Type(() => Number)
  roleId: number;
  @Expose()
  status: UserStatusEnum;

  createdAt: Date;
  updatedAt: Date;
  
  constructor(partial?: Partial<UserEntity>) {
    Object.assign(this, partial);
  }

}
