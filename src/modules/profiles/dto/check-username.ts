import { IsDefined, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CheckUsernameDto {
  @ApiProperty({ required: true, default: 'johndoe' })
  @IsOptional()
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(16)
  public username!: string;
}
