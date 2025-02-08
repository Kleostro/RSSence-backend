import { ApiProperty } from '@nestjs/swagger';

export class RoleDto {
  @ApiProperty({ required: true, default: 1 })
  public id!: number;

  @ApiProperty({ required: true, default: 'USER' })
  public name!: string;
}
