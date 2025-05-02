import { IsDefined, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreatePostDto {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(64)
  public title!: string;
  public content?: string;
  public imageUrls?: string[];
  public coauthorIds?: number[];
}
