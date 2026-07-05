import { useEffect, useMemo, useState } from 'react';
import { deaify, diffTexts, type DeaifyOptions, type DeaifyResult, type DiffSegment } from '@/deaify';

export interface DeaifyView {
  result: DeaifyResult;
  diff: DiffSegment[];
}

/**
 * Runs the rule-based cleanup live over `input`, debounced so typing stays smooth.
 * The heavy work is pure and fast, but debouncing avoids re-diffing on every keystroke.
 */
export function useDeaify(input: string, options: DeaifyOptions, delayMs = 200): DeaifyView {
  const [debounced, setDebounced] = useState(input);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(input), delayMs);
    return () => clearTimeout(id);
  }, [input, delayMs]);

  // Serialise options so the memo only recomputes when they actually change.
  const optKey = JSON.stringify(options);

  return useMemo(() => {
    const result = deaify(debounced, options);
    return { result, diff: diffTexts(debounced, result.text) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced, optKey]);
}
