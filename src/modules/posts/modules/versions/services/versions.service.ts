import { QueryParamsDto } from '@/common/dto/query-params.dto';
import { PaginatedResponse } from '@/common/interfaces/pagination.interface';
import { PaginationService } from '@/common/services/pagination.service';
import { Author, PostVersion, Prisma } from '@/generated/prisma';
import { PostModel } from '@/generated/prisma/models';
import { ACTION_TYPE } from '@/modules/posts/constants/post';
import { PostHistoryService } from '@/modules/posts/modules/history/services/post-history.service';
import { DiffService } from '@/modules/posts/modules/utils/diff.service';
import { PostVersionDiff } from '@/modules/posts/modules/versions/dto/post-version-diff';
import { PostService } from '@/modules/posts/services/post.service';
import { PrismaService } from '@/prisma/prisma.service';
import { ERROR_MESSAGES } from '@/shared/constants/error-message';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class VersionsService extends PaginationService {
  constructor(
    prisma: PrismaService,
    private readonly postService: PostService,
    private readonly postHistoryService: PostHistoryService,
    private readonly diffService: DiffService,
  ) {
    super(prisma);
  }

  public async createPostVersion(
    postId: number,
    title: string,
    content: string,
    coauthorsIds: number[],
    authorId: number,
  ): Promise<PostVersion> {
    const latestVersion = await this.prisma.postVersion.findFirst({
      where: { postId },

      orderBy: { version: 'desc' },
    });

    const version = (latestVersion?.version || 0) + 1;

    await this.prisma.postVersion.updateMany({
      where: { postId, isCurrent: true },
      data: { isCurrent: false },
    });

    return this.prisma.postVersion.create({
      data: {
        postId,
        title,
        content,
        version,
        coauthorsIds,
        isCurrent: true,
        authorId,
      },
    });
  }

  public async getVersionsByPost(id: number, params: QueryParamsDto): Promise<PaginatedResponse<PostVersion>> {
    await this.postService.findById(id);

    const args: Prisma.PostVersionFindManyArgs = { where: { postId: id }, orderBy: { version: 'desc' } };

    return this.getPaginatedResult<PostVersion, Prisma.PostVersionFindManyArgs>({
      model: this.prisma.postVersion,
      args,
      page: params.page,
      limit: params.limit,
    });
  }

  private async getValidCoauthorIds(tx: Prisma.TransactionClient, coauthorIds: number[]): Promise<number[]> {
    if (!coauthorIds.length) {
      return [];
    }

    const existing = await tx.author.findMany({
      where: { id: { in: coauthorIds } },
      select: { id: true },
    });

    return existing.map((a) => a.id);
  }

  private async deactivateCurrentVersion(tx: Prisma.TransactionClient, postId: number): Promise<void> {
    await tx.postVersion.updateMany({
      where: { postId, isCurrent: true },
      data: { isCurrent: false },
    });
  }

  private async activateTargetVersion(tx: Prisma.TransactionClient, versionId: number): Promise<void> {
    await tx.postVersion.update({
      where: { id: versionId },
      data: { isCurrent: true },
    });
  }

  public async revertToVersion(id: number, version: number, author: Author | undefined): Promise<PostModel> {
    if (!author) {
      throw new NotFoundException(ERROR_MESSAGES.AUTHOR_NOT_FOUND);
    }

    await this.postService.findById(id);

    const targetVersion = await this.prisma.postVersion.findFirst({
      where: { postId: id, version },
    });

    if (!targetVersion) {
      throw new NotFoundException(ERROR_MESSAGES.VERSION_NOT_FOUND);
    }

    return this.prisma.$transaction(async (tx) => {
      const validCoauthorIds = await this.getValidCoauthorIds(tx, targetVersion.coauthorsIds);
      await this.deactivateCurrentVersion(tx, id);
      await this.activateTargetVersion(tx, targetVersion.id);

      const updatedPost = await tx.post.update({
        where: { id },
        data: {
          title: targetVersion.title,
          content: targetVersion.content,
          slug: targetVersion.slug,
          authors: {
            deleteMany: { postId: id, isMainAuthor: false },
            create: validCoauthorIds.map((authorId) => ({ authorId, isMainAuthor: false })),
          },
        },
        include: { authors: { include: { author: true } } },
      });
      await this.postHistoryService.createOne({
        postId: updatedPost.id,
        actionType: ACTION_TYPE.POST_VERSION_REVERTED,
        authorId: author.id,
        description: `Post '${updatedPost.title}' was reverted to version ${version}`,
      });

      return updatedPost;
    });
  }

  public async deletePostVersion(id: number, version: number): Promise<PostVersion> {
    await this.postService.findById(id);

    const targetVersion = await this.prisma.postVersion.findFirst({ where: { id, version } });

    if (!targetVersion) {
      throw new NotFoundException(ERROR_MESSAGES.VERSION_NOT_FOUND);
    }

    return this.prisma.postVersion.delete({ where: { id: targetVersion.id } });
  }

  public async comparePostVersions(postId: number, from: number, to: number): Promise<PostVersionDiff> {
    const [versionFrom, versionTo] = await Promise.all([
      this.prisma.postVersion.findFirst({ where: { postId, version: from } }),
      this.prisma.postVersion.findFirst({ where: { postId, version: to } }),
    ]);

    if (!versionFrom) {
      throw new NotFoundException(`Version ${from} not found`);
    }
    if (!versionTo) {
      throw new NotFoundException(`Version ${to} not found`);
    }

    const [coauthorsFrom, coauthorsTo] = await Promise.all([
      this.postService.getAuthorsByIds(versionFrom.coauthorsIds),
      this.postService.getAuthorsByIds(versionTo.coauthorsIds),
    ]);

    const titleDiff = this.diffService.createSideBySideWithInlineDiff(versionFrom.title, versionTo.title);
    const contentDiff = this.diffService.createSideBySideWithInlineDiff(
      versionFrom.content ?? '',
      versionTo.content ?? '',
    );
    const coauthorsDiff = this.diffService.createSideBySideWithInlineDiff(
      coauthorsFrom.map((a) => a.username).join(', '),
      coauthorsTo.map((a) => a.username).join(', '),
    );

    return {
      versionFrom: versionFrom.version,
      versionTo: versionTo.version,
      createdAtFrom: versionFrom.createdAt,
      createdAtTo: versionTo.createdAt,
      title: { old: versionFrom.title, new: versionTo.title, diff: titleDiff },
      content: { old: versionFrom.content, new: versionTo.content, diff: contentDiff },
      coauthors: {
        old: coauthorsFrom.map((a) => a.username),
        new: coauthorsTo.map((a) => a.username),
        diff: coauthorsDiff,
      },
    };
  }
}
