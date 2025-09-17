import { IsDate, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

import { IsDateInRange } from '@/shared/validators/is-date-in-range.validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProfileDto {
  @ApiProperty({ required: true, default: 'John' })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(16)
  public firstname!: string;

  @ApiProperty({ required: true, default: 'Doe' })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(32)
  public lastname!: string;

  @ApiProperty({ required: true, default: 'johndoe' })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(16)
  public username!: string;

  @ApiProperty({ required: false, default: 'My bio' })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  public bio?: string;

  @ApiProperty({
    required: false,
    description:
      'Avatar image file. Allowed formats: JPG, WEBP, JPEG, PNG, SVG. Maximum file size: 8 MB. Recommended resolution: 500x500 pixels.',
    type: 'string',
    format: 'binary',
  })
  @IsOptional()
  @IsNotEmpty()
  public avatar?: File;

  @ApiProperty({
    required: false,
    type: 'string',
    format: 'date',
    default: '2000-01-01',
    example: '2000-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsDate()
  @IsDateInRange({ minDate: null, maxDate: new Date() }, { message: 'Birthdate must be a valid date in the past' })
  public birthdate?: string;
}
