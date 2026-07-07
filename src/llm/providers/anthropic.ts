import { LlmError, type LlmConfig, type LlmProvider } from '../types';
import { REWRITE_SYSTEM_PROMPT } from '../prompt';

const ENDPOINT = 'https://api.anthropic.com/v1/messages';

export const anthropicProvider: LlmProvider = {
  id: 'anthropic',
  label: 'Anthropic (Claude)',
  defaultModel: 'claude-haiku-4-5',
  keyHint: 'Create a key at console.anthropic.com. Set a spend limit; the app uses your key directly.',
  models: [
    { id: 'claude-haiku-4-5', label: 'Haiku 4.5 (cheap, default)' },
    { id: 'claude-sonnet-5', label: 'Sonnet 5 (balanced)' },
    { id: 'claude-opus-4-8', label: 'Opus 4.8 (max quality)' },
  ],

  async rewrite(input, cfg: LlmConfig, signal) {
    let res: Response;
    try {
      res = await fetch(ENDPOINT, {
        method: 'POST',
        signal,
        headers: {
          'content-type': 'application/json',
          'x-api-key': cfg.apiKey,
          'anthropic-version': '2023-06-01',
          // Required for direct browser calls (CORS). Harmless on native.
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: cfg.model,
          max_tokens: 4096,
          system: REWRITE_SYSTEM_PROMPT,
          messages: [{ role: 'user', content: input }],
        }),
      });
    } catch (e) {
      throw new LlmError(`Network error contacting Anthropic: ${(e as Error).message}`);
    }

    if (!res.ok) {
      const detail = await safeErrorText(res);
      throw new LlmError(`Anthropic error (${res.status})${detail ? `: ${detail}` : ''}`, res.status);
    }

    const json = (await res.json()) as { content?: { type: string; text?: string }[] };
    const text = json.content?.find((b) => b.type === 'text')?.text;
    if (!text) throw new LlmError('Anthropic returned no text.');
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
