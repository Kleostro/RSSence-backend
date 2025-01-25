import { IsDefined, IsEmail, IsNotEmpty } from 'class-validator';

export class CheckEmailDto {
  @IsDefined()
  @IsNotEmpty()
  @IsEmail()
  public email!: string;
}
