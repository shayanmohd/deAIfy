import { describe, it, expect } from 'vitest';
import { deaify, diffTexts } from '../../src/deaify';

const ch = (code: number) => String.fromCharCode(code);
const EM = ch(0x2014);
const EN = ch(0x2013);
const LDQUO = ch(0x201c);
const RDQUO = ch(0x201d);
const LSQUO = ch(0x2018);
const RSQUO = ch(0x2019);
const NBSP = ch(0x00a0);
const ZWSP = ch(0x200b);
const BOM = ch(0xfeff);

describe('dashes', () => {
  it('converts em dash to comma', () => {
    expect(deaify(`A ${EM} B`, { dashes: 'comma' }).text).toBe('A, B');
    expect(deaify(`A${EM}B`, { dashes: 'comma' }).text).toBe('A, B');
  });
  it('converts to spaced hyphen (default)', () => {
    expect(deaify(`A ${EM} B`, { dashes: 'spacedHyphen' }).text).toBe('A - B');
  });
  it('converts en dash and plain hyphen style', () => {
    expect(deaify(`A${EN}B`, { dashes: 'hyphen' }).text).toBe('A-B');
  });
  it('off leaves dashes untouched', () => {
    expect(deaify(`A ${EM} B`, { dashes: 'off' }).text).toBe(`A ${EM} B`);
  });
  it('does not merge a bulleted dash line into the previous line', () => {
    const input = `Intro\n${EM} item`;
    expect(deaify(input, { dashes: 'spacedHyphen' }).text).toBe('Intro\n - item');
  });
});

describe('quotes', () => {
  it('straightens curly quotes and apostrophes', () => {
    const input = `${LDQUO}He${RSQUO}s ${LSQUO}in${RSQUO}${RDQUO}`;
    expect(deaify(input, { quotes: true }).text).toBe(`"He's 'in'"`);
  });
});

describe('spaces', () => {
  it('normalises NBSP to a plain space and removes zero-width chars', () => {
    const input = `a${NBSP}b${ZWSP}c${BOM}`;
    const result = deaify(input, { spaces: true });
    // NBSP → space; ZWSP and BOM removed (so b and c become adjacent).
    expect(result.text).toBe('a bc');
    expect(result.text.length).toBeLessThan(input.length);
  });
});

describe('filler words', () => {
  it('flag mode records changes without altering text', () => {
    const input = 'We delve into the tapestry.';
    const r = deaify(input, { fillerWords: 'flag', dashes: 'off' });
    expect(r.text).toBe(input);
    expect(r.counts.filler).toBe(2);
  });
  it('soften mode replaces buzzwords with plain words', () => {
    const r = deaify('We delve into it.', { fillerWords: 'soften' });
    expect(r.text).toBe('We look into it.');
  });
  it('soften removes a stock transition and recapitalises', () => {
    const r = deaify('In conclusion, the results are clear.', { fillerWords: 'soften' });
    expect(r.text).toBe('The results are clear.');
  });

  // Regression: adjacent duplicate deletion phrases must not corrupt text (no dropped/glued letters).
  it('soften handles consecutive duplicate openers without corruption', () => {
    expect(deaify('Moreover, moreover works.', { fillerWords: 'soften' }).text).toBe('Works.');
    expect(deaify('Additionally additionally the plan is done.', { fillerWords: 'soften' }).text).toBe('The plan is done.');
  });

  // Regression: deletion adjacent to non-comma punctuation must not leave dangling punctuation.
  it('soften heals punctuation around deletions', () => {
    expect(deaify('The plan works, moreover.', { fillerWords: 'soften' }).text).toBe('The plan works.');
    expect(deaify('Moreover. We ship.', { fillerWords: 'soften' }).text).toBe('We ship.');
    expect(deaify('Moreover; we ship.', { fillerWords: 'soften' }).text).toBe('We ship.');
    expect(deaify('Moreover! We ship.', { fillerWords: 'soften' }).text).toBe('We ship.');
  });

  // Regression: a bare newline is not a sentence boundary for recapitalisation.
  it('soften does not capitalise a soft-wrapped continuation', () => {
    const r = deaify('This is a long line\nmoreover it continues.', { fillerWords: 'soften' });
    expect(r.text).toBe('This is a long line\nit continues.');
  });
});

describe('protectCode', () => {
  it('leaves quotes and dashes inside code untouched', () => {
    const input = `Text ${EM} here \`const x = a ${EM} b\` and ${LDQUO}quote${RDQUO}`;
    const r = deaify(input, { dashes: 'comma', quotes: true, protectCode: true });
    expect(r.text).toContain(`\`const x = a ${EM} b\``);
    expect(r.text).toContain('Text, here');
    expect(r.text).toContain('"quote"');
  });
  it('leaves fenced code blocks untouched', () => {
    const input = 'Before\n```\nlet s = ' + LDQUO + 'x' + RDQUO + '\n```\nAfter';
    const r = deaify(input, { quotes: true });
    expect(r.text).toContain(LDQUO + 'x' + RDQUO);
  });

  // Regression: literal private-use sentinel chars in input must not collide with placeholders.
  it('does not let user-supplied sentinel chars corrupt restored code', () => {
    const input = 'see `code` and ' + ch(0xe000) + '0' + ch(0xe001) + ' literal';
    const r = deaify(input, { protectCode: true, quotes: true });
    expect(r.text.match(/`code`/g)?.length).toBe(1); // the single real code span, not duplicated
  });
});

describe('idempotence', () => {
  it('applying twice equals applying once', () => {
    const input = `${LDQUO}We${RSQUO}ll delve${EM}${NBSP}into${ZWSP} the tapestry.${RDQUO} Moreover, it works.`;
    const opts = { dashes: 'comma' as const, quotes: true, spaces: true, fillerWords: 'soften' as const };
    const once = deaify(input, opts).text;
    const twice = deaify(once, opts).text;
    expect(twice).toBe(once);
  });
});

describe('diff', () => {
  it('marks removed and added segments', () => {
    const segs = diffTexts('a b c', 'a X c');
    expect(segs.some((s) => s.removed)).toBe(true);
    expect(segs.some((s) => s.added)).toBe(true);
  });
});
