import { DiffType } from '@/shared/constants/diff-type';

export interface InlineDiffPart {
  type: DiffType;
  value: string;
}

export interface DiffLine {
  type: DiffType;
  parts: InlineDiffPart[];
}

export interface SideBySideDiff {
  left: DiffLine[];
  right: DiffLine[];
}

export interface PostVersionDiff {
  title: {
    old: string;
    new: string;
    diff: SideBySideDiff;
  };
  content: {
    old: string | null;
    new: string | null;
    diff: SideBySideDiff;
  };
  coauthors: {
    old: string[];
    new: string[];
    diff: SideBySideDiff;
  };
  versionFrom: number;
  versionTo: number;
  createdAtFrom: Date;
  createdAtTo: Date;
}
