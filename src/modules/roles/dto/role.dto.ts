import { ApiProperty } from '@nestjs/swagger';

export class RoleDto {
  @ApiProperty()
  public id!: number;

  @ApiProperty()
  public name!: string;
}
