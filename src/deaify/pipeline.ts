import type { Change, ChangeType, DeaifyOptions, DeaifyResult } from './types';
import { DEFAULT_OPTIONS } from './types';
import { maskCode, restoreCode } from './transforms/protectCode';
import { transformSpaces } from './transforms/spaces';
import { transformQuotes } from './transforms/quotes';
import { transformDashes } from './transforms/dashes';
import { transformFillerWords } from './transforms/fillerWords';

const emptyCounts = (): Record<ChangeType, number> => ({ dash: 0, quote: 0, space: 0, filler: 0 });

/**
 * Runs the full rule-based cleanup pipeline: protectCode → spaces → quotes → dashes → filler.
 * Code spans/blocks and URLs are masked before the destructive passes when protectCode is on.
 * Returns the cleaned text, the flat list of Changes, and per-type counts.
 */
export function runPipeline(input: string, options: DeaifyOptions = {}): DeaifyResult {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const changes: Change[] = [];

  const { masked, tokens } = opts.protectCode ? maskCode(input) : { masked: input, tokens: [] as string[] };

  let text = masked;

  if (opts.spaces) {
    const r = transformSpaces(text);
    text = r.text;
    changes.push(...r.changes);
  }
  if (opts.quotes) {
    const r = transformQuotes(text);
    text = r.text;
    changes.push(...r.changes);
  }
  if (opts.dashes !== 'off') {
    const r = transformDashes(text, opts.dashes);
    text = r.text;
    changes.push(...r.changes);
  }
  if (opts.fillerWords !== 'off') {
    const r = transformFillerWords(text, opts.fillerWords, options.fillerList);
    text = r.text;
    changes.push(...r.changes);
  }

  text = opts.protectCode ? restoreCode(text, tokens) : text;

  const counts = emptyCounts();
  for (const c of changes) counts[c.type] += 1;

  return { text, changes, counts };
}
