import {
  ApiHideProperty,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import * as bcrypt from 'bcrypt';
import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { UserStatusEnum } from '../user-status.enum';
import { DeepPartial } from '@core/repository/type.repository';


export const GROUP_USER = 'owner';
export const GROUP_ALL_USERS = 'all_users';
export const GROUP_ADMIN = 'admin';
export const GROUP_DEFAULT = 'timestamps';

/**
 * User Entity
 */
export class UserEntity {
  @Expose({ groups: [GROUP_USER, GROUP_ADMIN] })
  id?: string;

  @Exclude()
  password: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  @Transform(({ value }) => (value !== 'null' ? value : ''))
  address: string;

  @ApiProperty()
  @Expose({
    groups: [GROUP_USER],
  })
  isTwoFAEnabled: boolean;

  @ApiProperty()
  @Transform(({ value }) => (value !== 'null' ? value : ''))
  contact: string;

  @ApiProperty()
  @Transform(({ value }) => (value !== 'null' ? value : ''))
  avatar: string;

  @ApiPropertyOptional()
  @Expose({
    groups: [GROUP_ADMIN],
  })
  status: UserStatusEnum;

  
  @Exclude({
    toClassOnly: true,
  })
  roleId: string;

  @Exclude({
    toClassOnly: true,
  })
  tokenValidityDate?: Date;

  @ApiPropertyOptional()
  @Expose({
    groups: [GROUP_DEFAULT],
  })
  created_at?: Date;

  @ApiPropertyOptional()
  @Expose({
    groups: [GROUP_DEFAULT],
  })
  updated_at?: Date;

  @Exclude({
    toPlainOnly: true,
  })
  token: string;

  @Exclude({
    toPlainOnly: true,
  })
  salt: string;

  @Exclude({
    toPlainOnly: true,
  })
  twoFASecret?: string | null;

  @Exclude({
    toPlainOnly: true,
  })
  twoFAThrottleTime?: Date | null;

  @Exclude({
    toPlainOnly: true,
  })
  skipHashPassword? = false;

  constructor(data?: DeepPartial<UserEntity>) {
    if (data) {
      Object.assign(this, data);
    }
  }

  async hashPasswordBeforeInsert() {
    if (this.password && !this.skipHashPassword) {
      await this.hashPassword();
    }
  }

  async hashPasswordBeforeUpdate() {
    if (this.password && !this.skipHashPassword) {
      await this.hashPassword();
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    const hash = await bcrypt.hash(password, this.salt);

    return hash === this.password;
  }

  async hashPassword() {
    this.salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, this.salt);
  }
}
