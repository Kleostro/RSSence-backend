import { IsArray, IsIn, IsOptional, IsString } from 'class-validator';

import { POST_MODERATOR_ACTION, PostModeratorAction } from '../../../constants/post';

export class PostModeratorActionDto {
  @IsIn(Object.values(POST_MODERATOR_ACTION))
  public action!: PostModeratorAction;

  @IsOptional()
  @IsString()
  public comment?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  public reasons?: string[];
}
