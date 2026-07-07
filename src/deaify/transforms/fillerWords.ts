import type { Change, FillerEntry, FillerMode, TransformResult } from '../types';
import { FILLER_WORDS } from '../data/fillerWords.data';

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const applyCase = (replacement: string, original: string) =>
  /^[A-Z]/.test(original) && replacement.length > 0
    ? replacement[0].toUpperCase() + replacement.slice(1)
    : replacement;

// True when the phrase at `index` begins a sentence (start of text, or after . ! ? or newline).
const atSentenceStart = (text: string, index: number) => {
  const before = text.slice(0, index).replace(/[ \t]+$/, '');
  return before.length === 0 || /[.!?\n]$/.test(before);
};

function buildRegex(entry: FillerEntry): RegExp {
  const body = escapeRe(entry.match);
  const src = entry.wholeWord === false ? body : `\\b${body}\\b`;
  return new RegExp(src, 'gi');
}

/**
 * Repairs the punctuation/spacing left behind after deletions, then recapitalises
 * sentence starts. Only ever runs when at least one phrase was deleted, so text with
 * no deletions is untouched. Idempotent.
 *
 * Recapitalisation deliberately fires ONLY after real sentence punctuation (. ! ?) or at
 * the very start, never after a bare newline, so a filler phrase opening a soft-wrapped
 * line does not wrongly capitalise a mid-sentence continuation.
 */
function healPunctuation(s: string): string {
  return s
    .replace(/[ \t]{2,}/g, ' ') // collapse runs of spaces/tabs
    .replace(/[ \t]+([,.;:!?])/g, '$1') // no space before punctuation
    .replace(/,[ \t]*,/g, ',') // doubled commas
    .replace(/,[ \t]*([.;:!?])/g, '$1') // comma immediately before sentence punctuation
    .replace(/([.!?])[ \t]*[,;:]/g, '$1') // sentence punctuation followed by a stray comma
    .replace(/(^|\n)[ \t]*[,;:][ \t]*/g, '$1') // leading punctuation at start of text/line
    .replace(/(^|[.!?]["')\]]?[ \t\n]+)([a-z])/g, (_m, p, c) => p + c.toUpperCase()) // recapitalise
    .replace(/[ \t]+$/gm, '') // trailing spaces per line
    .trim();
}

/**
 * Detects (flag) or removes/replaces (soften) AI filler words from the data list.
 * Entries are applied longest-match-first so multi-word phrases win over single words.
 *
 * Deletions choose their cut span from context: a phrase that opens a sentence absorbs the
 * following comma/sentence-punctuation; a mid/end-of-sentence phrase absorbs a preceding
 * comma instead so trailing punctuation is preserved. A final heal pass repairs spacing and
 * recapitalises. Idempotent.
 */
export function transformFillerWords(
  input: string,
  mode: FillerMode,
  list: FillerEntry[] = FILLER_WORDS
): TransformResult {
  if (mode === 'off') return { text: input, changes: [] };

  const entries = [...list].sort((a, b) => b.match.length - a.match.length);
  const changes: Change[] = [];
  let text = input;
  let deletedAny = false;

  for (const entry of entries) {
    const re = buildRegex(entry);
    let out = '';
    let last = 0;
    let m: RegExpExecArray | null;

    while ((m = re.exec(text)) !== null) {
      const original = m[0];
      if (original.length === 0) {
        re.lastIndex++;
        continue;
      }
      const ms = m.index;
      const me = ms + original.length;

      if (mode === 'flag') {
        out += text.slice(last, me);
        changes.push({ type: 'filler', start: ms, end: me, original, replacement: original, severity: 'flag', note: `filler (${entry.category})` });
        last = me;
        continue;
      }

      // soften: replace
      if (entry.soften !== null) {
        out += text.slice(last, ms);
        const replacement = applyCase(entry.soften, original);
        out += replacement;
        changes.push({ type: 'filler', start: ms, end: me, original, replacement, severity: 'auto', note: `softened (${entry.category})` });
        last = me;
        continue;
      }

      // soften: delete, picking the span to cut based on surrounding punctuation
      let cutStart = ms;
      let cutEnd = me;
      if (atSentenceStart(text, ms)) {
        // opener: absorb a following comma OR sentence punctuation, plus its spaces
        const a = /^[ \t]*(?:,|[.;:!?]+)?[ \t]*/.exec(text.slice(me));
        cutEnd = me + (a ? a[0].length : 0);
      } else {
        // mid/end: prefer to absorb a preceding ", " so trailing punctuation survives
        const pre = /[ \t]*,[ \t]*$/.exec(text.slice(0, ms));
        if (pre && ms - pre[0].length >= last) {
          cutStart = ms - pre[0].length;
        } else {
          const a = /^[ \t]*,?[ \t]*/.exec(text.slice(me));
          cutEnd = me + (a ? a[0].length : 0);
        }
      }

      out += text.slice(last, cutStart);
      changes.push({ type: 'filler', start: cutStart, end: cutEnd, original: text.slice(cutStart, cutEnd), replacement: '', severity: 'auto', note: `removed (${entry.category})` });
      last = cutEnd;
      deletedAny = true;
      // Never re-enter the consumed region (prevents overlap corruption on adjacent duplicates).
      re.lastIndex = cutEnd;
    }

    out += text.slice(last);
    text = out;
  }

  if (deletedAny) text = healPunctuation(text);

  return { text, changes };
}
