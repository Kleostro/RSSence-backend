import {
  IsDateString,
  IsDefined,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CreateProfileDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(16)
  public firstname?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(32)
  public lastname?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(16)
  public username?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  public bio?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @IsUrl()
  public avatarUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @IsDateString()
  public birthdate?: Date;
}
