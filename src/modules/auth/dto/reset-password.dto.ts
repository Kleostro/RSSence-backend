import { IsDefined, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'You can get the token from the password reset link that comes in the mail',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  public passwordResetToken!: string;

  @ApiProperty()
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @MaxLength(32)
  public newPassword!: string;
}
