import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class AuthDto {
  @ApiProperty({ required: true, default: 'johndoe@gmail.com' })
  @IsNotEmpty()
  @IsEmail()
  public email!: string;

  @ApiProperty({ required: true, default: 'password' })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @MaxLength(32)
  public password!: string;
}
