import type { DashStyle, TransformResult } from '../types';
import { applyRegex } from './util';

// Em dash U+2014, en dash U+2013, horizontal bar U+2015, figure dash U+2012.
// Surrounding horizontal whitespace (spaces/tabs, NOT newlines) is absorbed so
// "A — B", "A—B", and "A —B" all normalise consistently. Newlines are preserved
// so list bullets ("— item") don't get merged into the previous line.
const DASH = /[ \t]*[‒–—―]+[ \t]*/g;

/**
 * Replaces em/en dashes according to the chosen style.
 * 'off' leaves the text untouched. Idempotent for a fixed style.
 */
export function transformDashes(input: string, style: DashStyle): TransformResult {
  if (style === 'off') return { text: input, changes: [] };

  const replacement =
    style === 'comma' ? ', ' : style === 'spacedHyphen' ? ' - ' : '-';
  const note =
    style === 'comma'
      ? 'dash → comma'
      : style === 'spacedHyphen'
        ? 'dash → spaced hyphen'
        : 'dash → hyphen';

  return applyRegex(input, DASH, 'dash', () => replacement, 'auto', () => note);
}
