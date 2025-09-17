import { IsEmail, IsNotEmpty } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CheckEmailDto {
  @ApiProperty({ required: true, default: 'johndoe@gmail.com' })
  @IsNotEmpty()
  @IsEmail()
  public email!: string;
}
