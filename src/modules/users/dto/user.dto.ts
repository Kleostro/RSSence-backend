import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
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
