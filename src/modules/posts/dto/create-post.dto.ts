import { IsDefined, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreatePostDto {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  @MaxLength(150)
  public title!: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @MinLength(50)
  @MaxLength(5000)
  public content!: string;
  public coauthorIds?: number[];
}
