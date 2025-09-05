export const DIFF_TYPE = {
  COMMON: 'common',
  ADD: 'add',
  REMOVE: 'remove',
} as const;

export type DiffType = (typeof DIFF_TYPE)[keyof typeof DIFF_TYPE];
