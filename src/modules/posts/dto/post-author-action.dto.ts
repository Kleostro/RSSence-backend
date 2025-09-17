import { IsIn } from 'class-validator';

import { POST_AUTHOR_ACTION, PostAuthorAction } from '../constants/post';

export class PostAuthorActionDto {
  @IsIn(Object.values(POST_AUTHOR_ACTION))
  public action!: PostAuthorAction;
}
