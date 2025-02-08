import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ required: true, default: 'johndoe@gmail.com' })
  public email!: string;

  public hashedPassword!: string;
}
