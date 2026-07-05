// Public entry point for the pure, framework-agnostic deAIfy core.
import type { DeaifyOptions, DeaifyResult } from './types';
import { runPipeline } from './pipeline';

/** Clean AI "tells" out of `input` using the rule-based pipeline. */
export function deaify(input: string, options?: DeaifyOptions): DeaifyResult {
  return runPipeline(input, options);
}

export { diffTexts } from './diff';
export type { DiffSegment } from './diff';
export { FILLER_WORDS } from './data/fillerWords.data';
export * from './types';
