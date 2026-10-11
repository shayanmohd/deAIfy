import { createMockStream } from '@zibby-run/app-kit/mock';

// Development only: the Zibby App Kit's mock engine answers the AI rewrite with this
// canned text, so a local run never calls a model or spends anyone's credits.
// From devtools, window.__zibbyAiMock = { fail: 'session_cap_reached' } (or
// 'insufficient_credits', 'rate_limited', 'unknown_model') rehearses a refusal.
export const MOCK_REWRITE =
  'Mock rewrite, no model was called. We need to work through these ideas carefully to get the most out of them. The results hold up.';

export const mockStreamZibbyAi = createMockStream({
  cannedAnswer: () => MOCK_REWRITE,
  // The mock charges this plus one, so a charge line that echoed an estimate would show.
  quoteFor: () => 2,
});
