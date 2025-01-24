import { IsDefined, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CheckUsernameDto {
  @IsOptional()
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(16)
  public username?: string;
}
