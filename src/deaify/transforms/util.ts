import type { Change, ChangeType, ChangeSeverity } from '../types';

/**
 * Run a global regex over `input`, recording a Change for every match and building
 * the rewritten string. `replacer(match)` returns the replacement text.
 * Offsets in the returned Changes are relative to `input`.
 */
export function applyRegex(
  input: string,
  regex: RegExp,
  type: ChangeType,
  replacer: (match: RegExpExecArray) => string,
  severity: ChangeSeverity = 'auto',
  note?: (match: RegExpExecArray) => string | undefined
): { text: string; changes: Change[] } {
  const changes: Change[] = [];
  let out = '';
  let last = 0;
  // Ensure the regex is global so exec advances through the string.
  const re = regex.global ? regex : new RegExp(regex.source, regex.flags + 'g');
  re.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(input)) !== null) {
    const original = m[0];
    if (original.length === 0) {
      re.lastIndex++; // guard against zero-length matches
      continue;
    }
    const replacement = replacer(m);
    out += input.slice(last, m.index) + replacement;
    last = m.index + original.length;
    changes.push({
      type,
      start: m.index,
      end: m.index + original.length,
      original,
      replacement,
      severity,
      note: note?.(m),
    });
  }
  out += input.slice(last);
  return { text: out, changes };
}
