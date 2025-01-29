import { ApiProperty } from '@nestjs/swagger';
import { $Enums, User } from '@prisma/client';

export class UserDto implements User {
  @ApiProperty()
  public id!: number;

  @ApiProperty()
  public email!: string;

  @ApiProperty()
  public hashedPassword!: string;

  @ApiProperty()
  public status!: $Enums.UserStatus;

  @ApiProperty()
  public createdAt!: Date;

  @ApiProperty()
  public updatedAt!: Date;
}
