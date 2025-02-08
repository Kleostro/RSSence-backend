import { IsDefined, IsNotEmpty, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({ required: true, default: 'USER' })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  public name!: string;
}
