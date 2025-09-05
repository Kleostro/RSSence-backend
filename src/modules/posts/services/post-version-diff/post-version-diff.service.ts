/* eslint-disable no-continue */
import * as Diff from 'diff';

import { DIFF_TYPE, DiffType } from '@/shared/constants/diff-type';
import { Injectable } from '@nestjs/common';

import { DiffLine, InlineDiffPart, SideBySideDiff } from '../../interfaces/post-version-diff';

@Injectable()
export class PostVersionDiffService {
  public createSideBySideWithInlineDiff(oldStr: string, newStr: string): SideBySideDiff {
    const oldLines = this.splitLines(oldStr);
    const newLines = this.splitLines(newStr);

    const left: DiffLine[] = [];
    const right: DiffLine[] = [];

    const maxLen = Math.max(oldLines.length, newLines.length);

    for (let i = 0; i < maxLen; i += 1) {
      const oldLine = oldLines[i] ?? '';
      const newLine = newLines[i] ?? '';

      if (!oldLine && !newLine) {
        continue;
      }

      const inlineDiff = this.createInlineDiff(oldLine, newLine);

      const hasRemovals = inlineDiff.left.some((p) => p.type === DIFF_TYPE.REMOVE);
      const hasAdditions = inlineDiff.right.some((p) => p.type === DIFF_TYPE.ADD);

      let leftLineType: DiffType;
      let rightLineType: DiffType;

      if (oldLine && !newLine) {
        leftLineType = DIFF_TYPE.REMOVE;
        rightLineType = DIFF_TYPE.COMMON;
      } else if (!oldLine && (newLine || hasRemovals)) {
        leftLineType = DIFF_TYPE.COMMON;
        rightLineType = DIFF_TYPE.ADD;
      } else if (hasRemovals || hasAdditions) {
        leftLineType = DIFF_TYPE.REMOVE;
        rightLineType = DIFF_TYPE.ADD;
      } else {
        leftLineType = DIFF_TYPE.COMMON;
        rightLineType = DIFF_TYPE.COMMON;
      }

      left.push({ type: leftLineType, parts: inlineDiff.left });
      right.push({ type: rightLineType, parts: inlineDiff.right });
    }

    return { left, right };
  }

  private splitLines(str: string): string[] {
    return str.split('\n').map((line) => line.trimEnd());
  }

  private createInlineDiff(oldLine: string, newLine: string): { left: InlineDiffPart[]; right: InlineDiffPart[] } {
    const diff = Diff.diffWordsWithSpace(oldLine, newLine);

    const left: InlineDiffPart[] = [];
    const right: InlineDiffPart[] = [];

    diff.forEach((part) => {
      if (part.removed) {
        part.value.split('').forEach((char) => {
          left.push({ type: DIFF_TYPE.REMOVE, value: char });
        });
      }
      if (part.added) {
        part.value.split('').forEach((char) => {
          right.push({ type: DIFF_TYPE.ADD, value: char });
        });
      }
      if (!part.added && !part.removed) {
        part.value.split('').forEach((char) => {
          left.push({ type: DIFF_TYPE.COMMON, value: char });
          right.push({ type: DIFF_TYPE.COMMON, value: char });
        });
      }
    });

    return { left, right };
  }
}
