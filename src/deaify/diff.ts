import { diffWordsWithSpace } from 'diff';

export interface DiffSegment {
  value: string;
  added?: boolean;
  removed?: boolean;
}

/**
 * Word-level diff of the ORIGINAL text against the FINAL cleaned output.
 * Diffing the endpoints (rather than tracking offsets across five passes) keeps the
 * highlight robust and free of offset drift. Returns segments for a green/red render.
 */
export function diffTexts(original: string, cleaned: string): DiffSegment[] {
  return diffWordsWithSpace(original, cleaned).map((part) => ({
    value: part.value,
    added: part.added,
    removed: part.removed,
  }));
}
