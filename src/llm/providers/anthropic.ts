import type { LlmProvider } from '../types';
import { REWRITE_SYSTEM_PROMPT } from '../prompt';

export const anthropicProvider: LlmProvider = {
  id: 'anthropic',
  label: 'Anthropic (Claude)',
  defaultModel: 'claude-haiku-4-5-20251001',
  models: [
    { id: 'claude-haiku-4-5-20251001', label: 'Haiku 4.5 (cheap, default)' },
    { id: 'claude-sonnet-5', label: 'Sonnet 5 (balanced)' },
    { id: 'claude-opus-5', label: 'Opus 5 (max quality)' },
  ],

  // Anthropic Messages body.
  payload: (input, model) => ({
    model,
    max_tokens: 4096,
    system: REWRITE_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: input }],
  }),
};
