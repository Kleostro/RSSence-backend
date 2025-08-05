import { ModerationTargetType, PostActionType, PostStatus } from '@/generated/prisma';

export class CreateModerationHistory {
  public moderatorId!: number;
  public previousStatus?: PostStatus;
  public actionType!: PostActionType;
  public targetId!: number;
  public targetType!: ModerationTargetType;
  public newStatus!: PostStatus;
  public comment?: string;
  public reasons?: string[];
}
