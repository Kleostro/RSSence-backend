import { IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class CreatePostDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  @MaxLength(150)
  @Matches(/^[a-zA-Zа-яА-Я0-9\s\-']+$/, {
    message:
      "Title must contain only letters, numbers, spaces, hyphens (-), and apostrophes ('). No special characters allowed.",
  })
  public title!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(50)
  @MaxLength(5000)
  public content!: string;

  public coauthorIds?: number[];
}
