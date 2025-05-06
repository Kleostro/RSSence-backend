import { User } from '@/generated/prisma';
import { ApiProperty } from '@nestjs/swagger';

export class UserDto implements User {
  @ApiProperty()
  public id!: number;

  @ApiProperty()
  public email!: string;

  @ApiProperty()
  public hashedPassword!: string;

  @ApiProperty()
  public createdAt!: Date;

  @ApiProperty()
  public updatedAt!: Date;
}
