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

export class CreateProfileDto {
  @IsOptional()
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(16)
  public firstname?: string;

  @IsOptional()
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(32)
  public lastname?: string;

  @IsOptional()
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  public bio?: string;

  @IsOptional()
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @IsUrl()
  public avatarUrl?: string;

  @IsOptional()
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @IsDateString()
  public birthdate?: Date;
}
