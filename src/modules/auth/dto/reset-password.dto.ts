import { IsDefined, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    required: true,
    description: 'You can get the token from the password reset link that comes in the mail',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  public passwordResetToken!: string;

  @ApiProperty({ required: true, default: 'new-password' })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @MaxLength(32)
  public newPassword!: string;
}
