import { ApiProperty } from '@nestjs/swagger';

export class TokensDto {
  @ApiProperty()
  public accessToken!: string;

  @ApiProperty()
  public refreshToken!: string;
}
