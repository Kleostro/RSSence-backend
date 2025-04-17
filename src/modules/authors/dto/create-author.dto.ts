import { IsDefined, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateAuthorDto {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(16)
  public username!: string;

  @IsOptional()
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  public bio?: string;

  @IsOptional()
  @IsDefined()
  @IsNotEmpty()
  public avatar?: File;
}
