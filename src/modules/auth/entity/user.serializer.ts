import { ModelSerializer } from '@core/serializer/model.serializer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { UserStatusEnum } from '../user-status.enum';

export const defaultUserGroupsForSerializing: string[] = ['timestamps'];

export class UserSerializer extends ModelSerializer {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  email: string;

  @ApiPropertyOptional()
  @Expose({
    groups: defaultUserGroupsForSerializing,
  })
  createdAt: Date;

  @ApiPropertyOptional()
  @Expose({
    groups: defaultUserGroupsForSerializing,
  })
  updatedAt: Date;

  @Exclude()
  password: string;
}
