// Masks fenced ```code``` and inline `code` (and bare URLs) with placeholder tokens
// BEFORE the destructive passes, then restores them afterwards — so we never straighten
// quotes or swap dashes inside code or links.
//
// Placeholders use Unicode Private-Use-Area chars so the space/quote/dash/filler passes
// can never match or split them.

const OPEN = '';
const CLOSE = '';

// Order matters: fenced blocks first (they may contain backticks), then inline, then URLs.
const PATTERNS: RegExp[] = [
  /```[\s\S]*?```/g, // fenced code blocks
  /`[^`\n]+`/g, // inline code
  /\b(?:https?:\/\/|www\.)[^\s<>()]+/gi, // bare URLs
];

export interface MaskResult {
  masked: string;
  tokens: string[];
}

export function maskCode(input: string): MaskResult {
  const tokens: string[] = [];
  // Strip any pre-existing sentinel chars so user text can never collide with a placeholder
  // and get overwritten on restore. These Private-Use-Area chars never appear in real prose.
  let masked = input.replace(new RegExp(`[${OPEN}${CLOSE}]`, 'g'), '');
  for (const pattern of PATTERNS) {
    masked = masked.replace(pattern, (m) => {
      const token = `${OPEN}${tokens.length}${CLOSE}`;
      tokens.push(m);
      return token;
    });
  }
  return { masked, tokens };
}

export function restoreCode(text: string, tokens: string[]): string {
  if (tokens.length === 0) return text;
  // Replace from the outside in; token indices are unique so a single pass is enough.
  return text.replace(new RegExp(`${OPEN}(\\d+)${CLOSE}`, 'g'), (_m, i) => tokens[Number(i)] ?? _m);
}
