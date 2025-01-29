import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty()
  public email!: string;

  public hashedPassword!: string;
}
