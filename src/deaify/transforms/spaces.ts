import type { TransformResult } from '../types';
import { applyRegex } from './util';

// Truly invisible characters AI models often emit — removed entirely.
const ZERO_WIDTH_CODES = [
  0x200b, // zero-width space
  0x200c, // zero-width non-joiner
  0x200d, // zero-width joiner
  0x2060, // word joiner
  0xfeff, // BOM / zero-width no-break space
  0x00ad, // soft hyphen
  0x200e, // left-to-right mark
  0x200f, // right-to-left mark
];

// Non-standard whitespace that renders as a space — normalised to a plain space (U+0020).
const WEIRD_SPACE_CODES = [
  0x00a0, // no-break space
  0x2000, 0x2001, 0x2002, 0x2003, 0x2004, 0x2005, 0x2006, 0x2007, 0x2008, 0x2009, 0x200a, // width-space block
  0x202f, // narrow no-break space
  0x205f, // medium mathematical space
  0x3000, // ideographic space
];

const toClass = (codes: number[]) =>
  new RegExp('[' + codes.map((c) => '\\u' + c.toString(16).padStart(4, '0')).join('') + ']', 'g');

const ZERO_WIDTH = toClass(ZERO_WIDTH_CODES);
const WEIRD_SPACE = toClass(WEIRD_SPACE_CODES);

/**
 * Strips zero-width characters and normalises exotic whitespace to a plain space.
 * NBSP becomes a real space (not deleted); true zero-width chars are removed.
 * Idempotent: plain ASCII text is untouched.
 */
export function transformSpaces(input: string): TransformResult {
  const zw = applyRegex(input, ZERO_WIDTH, 'space', () => '', 'auto', () => 'removed hidden character');
  const sp = applyRegex(zw.text, WEIRD_SPACE, 'space', () => ' ', 'auto', () => 'normalised space');
  return { text: sp.text, changes: [...zw.changes, ...sp.changes] };
}
