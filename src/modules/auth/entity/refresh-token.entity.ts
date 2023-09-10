import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenEntity {
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  ip: string;

  @ApiProperty()
  userAgent: string;

  @ApiProperty()
  browser?: string;

  @ApiProperty()
  os?: string;

  @ApiProperty()
  isRevoked: boolean;

  @ApiProperty()
  expires: Date;

  constructor(data?: Partial<RefreshTokenEntity>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}
