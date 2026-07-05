import type { FillerEntry } from '../types';

// Single source of truth for AI "tell" words/phrases.
// `soften: null` means delete the phrase and collapse the surrounding punctuation/space.
// Extend freely — the filler transform compiles this into one alternation regex at load.
export const FILLER_WORDS: FillerEntry[] = [
  // Inflated buzzwords
  { match: 'delve', soften: 'look', category: 'buzzword' },
  { match: 'delving', soften: 'looking', category: 'buzzword' },
  { match: 'tapestry', soften: 'mix', category: 'buzzword' },
  { match: 'leverage', soften: 'use', category: 'buzzword' },
  { match: 'leveraging', soften: 'using', category: 'buzzword' },
  { match: 'utilize', soften: 'use', category: 'buzzword' },
  { match: 'utilizing', soften: 'using', category: 'buzzword' },
  { match: 'realm', soften: 'area', category: 'buzzword' },
  { match: 'showcase', soften: 'show', category: 'buzzword' },
  { match: 'seamless', soften: 'smooth', category: 'buzzword' },
  { match: 'seamlessly', soften: 'smoothly', category: 'buzzword' },
  { match: 'robust', soften: 'strong', category: 'buzzword' },
  { match: 'myriad', soften: 'many', category: 'buzzword' },
  { match: 'plethora', soften: 'plenty', category: 'buzzword' },

  // Stock transitions
  { match: 'moreover', soften: null, category: 'transition' },
  { match: 'furthermore', soften: null, category: 'transition' },
  { match: 'additionally', soften: null, category: 'transition' },
  { match: 'consequently', soften: 'so', category: 'transition' },
  { match: 'nevertheless', soften: 'still', category: 'transition' },
  { match: 'notwithstanding', soften: null, category: 'transition' },

  // Hedges
  { match: 'arguably', soften: null, category: 'hedge' },
  { match: 'notably', soften: null, category: 'hedge' },
  { match: 'importantly', soften: null, category: 'hedge' },

  // Meta-commentary (multi-word — matched before single words by length)
  { match: "it's important to note that", soften: null, category: 'meta' },
  { match: 'it is important to note that', soften: null, category: 'meta' },
  { match: "it's important to note", soften: null, category: 'meta' },
  { match: 'it is worth noting that', soften: null, category: 'meta' },
  { match: 'in conclusion', soften: null, category: 'meta' },
  { match: 'in summary', soften: null, category: 'meta' },
  { match: 'at the end of the day', soften: null, category: 'meta' },
  { match: 'when it comes to', soften: null, category: 'meta' },
];
