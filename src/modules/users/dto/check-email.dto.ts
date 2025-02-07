import { IsDefined, IsEmail, IsNotEmpty } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CheckEmailDto {
  @ApiProperty({ required: true, default: 'johndoe@gmail.com' })
  @IsDefined()
  @IsNotEmpty()
  @IsEmail()
  public email!: string;
}
