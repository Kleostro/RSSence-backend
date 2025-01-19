import { IsEmail, IsString, MaxLength, MinLength, ValidateIf } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  public email!: string;

  @IsString()
  @MinLength(6)
  @MaxLength(32)
  public password!: string;

  @ValidateIf((o: CreateUserDto) => o.username !== undefined)
  @IsString()
  @MinLength(5, { each: false, always: false })
  @MaxLength(16, { each: false, always: false })
  public username?: string;
}
