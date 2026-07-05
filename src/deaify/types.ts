// Pure, framework-agnostic types for the deAIfy core.
// NOTHING in src/deaify/** may import react-native, expo-*, or the DOM.

export type ChangeType = 'dash' | 'quote' | 'space' | 'filler';

/** 'auto' = the transform rewrote the text. 'flag' = detected only, text unchanged. */
export type ChangeSeverity = 'auto' | 'flag';

export interface Change {
  type: ChangeType;
  /** Offsets into the transform's INPUT string (not the final output). */
  start: number;
  end: number;
  original: string;
  /** '' = deletion; a value === original means flag-only (no rewrite). */
  replacement: string;
  severity: ChangeSeverity;
  note?: string;
}

export type FillerCategory = 'buzzword' | 'transition' | 'hedge' | 'meta';

export interface FillerEntry {
  /** The phrase to match, case-insensitive. */
  match: string;
  /** Replacement when softening; null = delete the phrase and tidy surrounding punctuation. */
  soften: string | null;
  category: FillerCategory;
  /** Wrap in word boundaries. Default true. Set false for phrases that start/end mid-token. */
  wholeWord?: boolean;
}

export type DashStyle = 'comma' | 'spacedHyphen' | 'hyphen' | 'off';
export type FillerMode = 'off' | 'flag' | 'soften';

export interface DeaifyOptions {
  dashes?: DashStyle;
  quotes?: boolean;
  spaces?: boolean;
  fillerWords?: FillerMode;
  /** Mask fenced/inline code before destructive passes so it is never mangled. Default true. */
  protectCode?: boolean;
  /** Override the built-in filler list. */
  fillerList?: FillerEntry[];
}

export interface TransformResult {
  text: string;
  changes: Change[];
}

export interface Transform {
  name: ChangeType;
  run(input: string, opts: Required<Pick<DeaifyOptions, 'dashes' | 'quotes' | 'spaces' | 'fillerWords'>> & DeaifyOptions): TransformResult;
}

export interface DeaifyResult {
  text: string;
  changes: Change[];
  counts: Record<ChangeType, number>;
}

export const DEFAULT_OPTIONS: Required<Omit<DeaifyOptions, 'fillerList'>> = {
  dashes: 'spacedHyphen',
  quotes: true,
  spaces: true,
  fillerWords: 'flag',
  protectCode: true,
};
