import { IsDefined, IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class AuthDto {
  @ApiProperty({ required: true, default: 'johndoe@gmail.com' })
  @IsDefined()
  @IsNotEmpty()
  @IsEmail()
  public email!: string;

  @ApiProperty({ required: true, default: 'password' })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @MaxLength(32)
  public password!: string;
}
