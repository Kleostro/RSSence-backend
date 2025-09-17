import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateAuthorDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(16)
  public firstname!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(32)
  public lastname!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(16)
  public username!: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  public bio?: string;

  @IsOptional()
  @IsNotEmpty()
  public avatar?: File;
}
