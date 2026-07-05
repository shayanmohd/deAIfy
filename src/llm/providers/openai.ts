import { LlmError, type LlmConfig, type LlmProvider } from '../types';
import { REWRITE_SYSTEM_PROMPT } from '../prompt';

const ENDPOINT = 'https://api.openai.com/v1/chat/completions';

export const openaiProvider: LlmProvider = {
  id: 'openai',
  label: 'OpenAI (GPT)',
  defaultModel: 'gpt-4o-mini',
  keyHint: 'Create a key at platform.openai.com. Set a usage limit — the app uses your key directly.',
  models: [
    { id: 'gpt-4o-mini', label: 'GPT-4o mini (cheap, default)' },
    { id: 'gpt-4o', label: 'GPT-4o (balanced)' },
    { id: 'gpt-4.1', label: 'GPT-4.1 (max quality)' },
  ],

  async rewrite(input, cfg: LlmConfig, signal) {
    let res: Response;
    try {
      res = await fetch(ENDPOINT, {
        method: 'POST',
        signal,
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${cfg.apiKey}`,
        },
        body: JSON.stringify({
          model: cfg.model,
          messages: [
            { role: 'system', content: REWRITE_SYSTEM_PROMPT },
            { role: 'user', content: input },
          ],
        }),
      });
    } catch (e) {
      throw new LlmError(`Network error contacting OpenAI: ${(e as Error).message}`);
    }

    if (!res.ok) {
      const detail = await safeErrorText(res);
      throw new LlmError(`OpenAI error (${res.status})${detail ? `: ${detail}` : ''}`, res.status);
    }

    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const text = json.choices?.[0]?.message?.content;
    if (!text) throw new LlmError('OpenAI returned no text.');
    return text.trim();
  },
};

async function safeErrorText(res: Response): Promise<string> {
  try {
    const j = (await res.json()) as { error?: { message?: string } };
    return j.error?.message ?? '';
  } catch {
    return '';
  }
}
