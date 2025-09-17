export const TARGET_TYPE = {
  POST: 'POST',
  COMMENT: 'COMMENT',
  USER: 'USER',
  MEDIA: 'MEDIA',
} as const;

export const ACTION_TYPE = {
  POST_CREATED: 'POST_CREATED',
  POST_SUBMITTED: 'POST_SUBMITTED',
  POST_VERSION_REVERTED: 'POST_VERSION_REVERTED',
  POST_UPDATED: 'POST_UPDATED',
  MODERATION_STATUS_CHANGED: 'MODERATION_STATUS_CHANGED',
} as const;

export const POST_STATUS = {
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  REVISION_REQUIRED: 'REVISION_REQUIRED',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;

export const POST_STATUS_LABEL = {
  DRAFT: 'Draft',
  SUBMITTED: 'Under review',
  REVISION_REQUIRED: 'Revision required',
  APPROVED: 'Published',
  REJECTED: 'Rejected',
} as const;

export const POST_AUTHOR_ACTION = {
  SUBMIT: 'SUBMIT',
  SAVE_AS_DRAFT: 'SAVE_AS_DRAFT',
} as const;

export type PostAuthorAction = keyof typeof POST_AUTHOR_ACTION;

export const POST_MODERATOR_ACTION = {
  APPROVE: 'APPROVE',
  REJECT: 'REJECT',
  REVISION_REQUEST: 'REVISION_REQUEST',
} as const;

export type PostModeratorAction = keyof typeof POST_MODERATOR_ACTION;
