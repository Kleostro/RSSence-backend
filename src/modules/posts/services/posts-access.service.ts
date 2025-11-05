import { Author, PostAuthor, Prisma } from '@/generated/prisma';
import { PostModel } from '@/generated/prisma/models';
import { ROLES } from '@/shared/constants/roles';
import { Injectable, NotFoundException } from '@nestjs/common';

import { RolesService } from '../../roles/roles.service';
import { FullUser } from '../../users/types/user.type';
import { POST_ACCESS_LEVEL, PostAccessLevel } from '../constants/post';
import { PostsService } from './posts.service';

@Injectable()
export class PostsAccessService {
  constructor(
    private readonly rolesService: RolesService,
    private readonly postsService: PostsService,
  ) {}

  public async hasAccess(
    user: FullUser | null,
    postWhere: Prisma.PostWhereUniqueInput,
    level: PostAccessLevel,
  ): Promise<boolean> {
    if (level === POST_ACCESS_LEVEL.MODERATOR_OR_HIGHER) {
      return this.checkModeratorOrHigherAccess(user);
    }

    const post = await this.postsService.findPostWithAuthors(postWhere);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (!user) {
      return false;
    }

    switch (level) {
      case POST_ACCESS_LEVEL.AUTHOR_ONLY:
        return this.checkAuthorOnlyAccess(user, post);
      case POST_ACCESS_LEVEL.MAIN_AUTHOR_ONLY:
        return this.checkMainAuthorOnlyAccess(user, post);
      case POST_ACCESS_LEVEL.AUTHOR_OR_MODERATOR:
        return this.checkAuthorOrModeratorAccess(user, post);
      default:
        return false;
    }
  }

  private async checkModeratorOrHigherAccess(user: FullUser | null): Promise<boolean> {
    if (!user) {
      return false;
    }
    return this.rolesService.hasPriorityAtLeast(user.roles, ROLES.MODERATOR);
  }

  private checkAuthorOnlyAccess(
    user: FullUser,
    post: PostModel & { authors: (PostAuthor & { author: Author })[] },
  ): boolean {
    return post.authors.some((a) => a.author?.userId === user.id);
  }

  private checkMainAuthorOnlyAccess(
    user: FullUser,
    post: PostModel & { authors: (PostAuthor & { author: Author })[] },
  ): boolean {
    return post.authors.some((a) => a.isMainAuthor && a.author?.userId === user.id);
  }

  private async checkAuthorOrModeratorAccess(
    user: FullUser,
    post: PostModel & { authors: (PostAuthor & { author: Author })[] },
  ): Promise<boolean> {
    const isAuthor = this.checkAuthorOnlyAccess(user, post);
    const isModeratorOrHigher = await this.rolesService.hasPriorityAtLeast(user.roles, ROLES.MODERATOR);
    return isAuthor || isModeratorOrHigher;
  }
}
