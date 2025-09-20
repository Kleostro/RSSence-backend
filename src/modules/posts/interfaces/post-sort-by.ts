export const PostSortBy = {
  CREATED_AT: 'createdAt',
  UPDATED_AT: 'updatedAt',
  TITLE: 'title',
  UNIQUE_VIEWS: 'uniqueViews',
  TOTAL_VIEWS: 'totalViews',
} as const;

export type PostSortBy = (typeof PostSortBy)[keyof typeof PostSortBy];
