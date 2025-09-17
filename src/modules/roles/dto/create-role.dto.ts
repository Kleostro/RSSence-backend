import { IsNotEmpty, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({ required: true, default: 'USER' })
  @IsNotEmpty()
  @IsString()
  public name!: string;

  @ApiProperty({ required: true, default: 0 })
  @IsNotEmpty()
  public priority!: number;
}
