import type { LlmProvider } from '../types';
import { REWRITE_SYSTEM_PROMPT } from '../prompt';

export const openaiProvider: LlmProvider = {
  id: 'openai',
  label: 'OpenAI (GPT)',
  defaultModel: 'gpt-5',
  models: [{ id: 'gpt-5', label: 'GPT-5 (default)' }],

  // OpenAI Chat Completions body.
  payload: (input, model) => ({
    model,
    messages: [
      { role: 'system', content: REWRITE_SYSTEM_PROMPT },
      { role: 'user', content: input },
    ],
  }),
};
