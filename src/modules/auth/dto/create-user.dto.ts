import { PartialType } from '@nestjs/swagger';
import { IsIn, IsString } from 'class-validator';
import { RegisterUserDto } from './register-user.dto';

import { UserStatusEnum } from '../user-status.enum';

const statusEnumArray = [
  UserStatusEnum.ACTIVE,
  UserStatusEnum.INACTIVE,
  UserStatusEnum.BLOCKED,
];

/**
 * create user data transform object
 */
export class CreateUserDto extends PartialType(RegisterUserDto) {
  @IsIn(statusEnumArray, {
    message: `isIn-{"items":"${statusEnumArray.join(',')}"}`,
  })
  status: UserStatusEnum;

  @IsString()
  roleId: string;
}
