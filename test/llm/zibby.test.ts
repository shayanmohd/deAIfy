import { afterEach, describe, it, expect, vi } from 'vitest';
import { setMockLoader, streamZibbyAi, ZibbyAiError, ZIBBY_COMPED_LINE } from '@zibby-run/app-kit';
import { PROVIDER_LIST } from '../../src/llm/registry';
import { REWRITE_SYSTEM_PROMPT } from '../../src/llm/prompt';
import { chargeLine, errorNotice, rewriteRequest } from '../../src/llm/zibby';
import { MOCK_REWRITE, mockStreamZibbyAi } from '../../src/llm/mock';

// Zibby's catalog (app-kit CONTRACT.md §2, "Models the platform sells"): every claude-* id
// rides the "anthropic" format, every other id "openai". A wrong pairing is 400 unknown_model.
const CATALOG_TEXT_MODELS = [
  'claude-sonnet-5',
  'claude-haiku-4-5-20251001',
  'claude-opus-5',
  'gpt-5',
  'x-ai/grok-4',
  'z-ai/glm-4.6',
  'moonshotai/kimi-k2',
];
const ACTION_RE = /^[a-z0-9_:.-]{1,64}$/;
const EM_DASH = String.fromCharCode(0x2014);

describe('models', () => {
  it('offers only catalog models, each on its provider format', () => {
    for (const provider of PROVIDER_LIST) {
      expect(provider.models.map((m) => m.id)).toContain(provider.defaultModel);
      for (const { id } of provider.models) {
        expect(CATALOG_TEXT_MODELS).toContain(id);
        expect(provider.id).toBe(id.startsWith('claude-') ? 'anthropic' : 'openai');
      }
    }
  });
});

describe('rewriteRequest', () => {
  it('builds an Anthropic Messages body with the rewrite prompt', () => {
    const req = rewriteRequest('Hello there.', 'anthropic', 'claude-sonnet-5');
    expect(req).toMatchObject({ provider: 'anthropic', model: 'claude-sonnet-5' });
    expect(req.action).toMatch(ACTION_RE);
    expect(req.payload).toMatchObject({
      model: 'claude-sonnet-5',
      system: REWRITE_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: 'Hello there.' }],
    });
  });

  it('builds an OpenAI chat body with the prompt as a system message', () => {
    const req = rewriteRequest('Hello there.', 'openai', 'gpt-5');
    expect(req).toMatchObject({ provider: 'openai', model: 'gpt-5' });
    expect(req.action).toMatch(ACTION_RE);
    expect(req.payload).toMatchObject({
      model: 'gpt-5',
      messages: [
        { role: 'system', content: REWRITE_SYSTEM_PROMPT },
        { role: 'user', content: 'Hello there.' },
      ],
    });
  });

  it('gives every offered model a valid action label', () => {
    for (const provider of PROVIDER_LIST) {
      for (const { id } of provider.models) {
        expect(rewriteRequest('x', provider.id, id).action).toMatch(ACTION_RE);
      }
    }
  });
});

describe('chargeLine', () => {
  it('quotes only the terminal frame', () => {
    expect(chargeLine({ charged_cr: 3, balance_cr: 97 }, 'req_1')).toBe('Charged 3 credits.');
    expect(chargeLine({ charged_cr: 1, balance_cr: 99 }, 'req_1')).toBe('Charged 1 credit.');
  });
  it('says nothing was charged for a zero charge', () => {
    expect(chargeLine({ charged_cr: 0, balance_cr: 100 }, 'req_1')).toBe('Nothing was charged.');
  });
  it("uses Zibby's sentence for a comped run", () => {
    expect(chargeLine({ charged_cr: 0, balance_cr: 100, comped: true }, 'req_1')).toBe(`${ZIBBY_COMPED_LINE}.`);
  });
  it('says the charge is unknown, with the request id, when no terminal frame arrived', () => {
    expect(chargeLine(null, 'req_9')).toBe('Charge unknown. Request id req_9.');
    expect(chargeLine(null, null)).toBe('Charge unknown.');
  });
});

describe('errorNotice', () => {
  const err = (code: ConstructorParameters<typeof ZibbyAiError>[0], details = {}) =>
    new ZibbyAiError(code, 'kit message', { details });

  it('offers a top-up for missing credits and a sign-in for a missing session', () => {
    expect(errorNotice(err('insufficient_credits'), 'gpt-5').action).toBe('top_up');
    expect(errorNotice(err('unauthenticated'), 'gpt-5').action).toBe('sign_in');
  });
  it('asks before going past the session cap, without money for a comped person', () => {
    const regular = errorNotice(err('session_cap_reached', { spent_cr: 40, cap_cr: 40 }), 'gpt-5');
    expect(regular.action).toBe('continue');
    expect(regular.message).toContain('40');
    const comped = errorNotice(err('session_cap_reached', { spent_cr: 40, cap_cr: 40, comped: true }), 'gpt-5');
    expect(comped.action).toBe('continue');
    expect(comped.message).not.toMatch(/credit/i);
  });
  it('never puts an em dash in front of the person', () => {
    const codes = [
      'insufficient_credits', 'session_cap_reached', 'rate_limited', 'unknown_model', 'unauthenticated',
      'locked', 'payload_too_large', 'network', 'malformed_stream', 'unknown',
    ] as const;
    for (const code of codes) expect(errorNotice(err(code), 'gpt-5').message).not.toContain(EM_DASH);
  });
});

describe('a rewrite on the mock', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('streams the canned rewrite and a terminal charge, without leaving the process', async () => {
    vi.stubEnv('NEXT_PUBLIC_ZIBBY_AI_MOCK', '1');
    setMockLoader(async () => mockStreamZibbyAi);
    const result = await streamZibbyAi(rewriteRequest('Moreover, we delve.', 'anthropic', 'claude-haiku-4-5-20251001'));
    expect(result.text).toBe(MOCK_REWRITE);
    expect(result.chargeKnown).toBe(true);
    expect(result.terminal?.charged_cr).toBeGreaterThan(0);
  });
});
