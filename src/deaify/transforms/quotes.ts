import type { TransformResult } from '../types';
import { applyRegex } from './util';

// Curly / typographic quotes → the straight ASCII quotes a human typically types.
// Double: “ ” „ ‟ « »  →  "
// Single: ‘ ’ ‚ ‛ ‹ › and the prime ′  →  '
const DOUBLE_CODES = [0x201c, 0x201d, 0x201e, 0x201f, 0x00ab, 0x00bb];
const SINGLE_CODES = [0x2018, 0x2019, 0x201a, 0x201b, 0x2039, 0x203a, 0x2032];

const toClass = (codes: number[]) =>
  new RegExp('[' + codes.map((c) => '\\u' + c.toString(16).padStart(4, '0')).join('') + ']', 'g');

const DOUBLE = toClass(DOUBLE_CODES);
const SINGLE = toClass(SINGLE_CODES);

/**
 * Converts curly quotes and apostrophes to straight ASCII quotes.
 * Idempotent: straight quotes are left as-is.
 */
export function transformQuotes(input: string): TransformResult {
  const d = applyRegex(input, DOUBLE, 'quote', () => '"', 'auto', () => 'straightened quote');
  const s = applyRegex(d.text, SINGLE, 'quote', () => "'", 'auto', () => 'straightened apostrophe');
  return { text: s.text, changes: [...d.changes, ...s.changes] };
}
