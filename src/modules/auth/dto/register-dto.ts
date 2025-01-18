import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  public email!: string;

  @IsString()
  @MinLength(6)
  @MaxLength(32)
  public password!: string;
}
