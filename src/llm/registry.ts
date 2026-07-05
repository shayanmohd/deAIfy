import type { LlmProvider, ProviderId } from './types';
import { anthropicProvider } from './providers/anthropic';
import { openaiProvider } from './providers/openai';

export const PROVIDERS: Record<ProviderId, LlmProvider> = {
  anthropic: anthropicProvider,
  openai: openaiProvider,
};

export const PROVIDER_LIST: LlmProvider[] = [anthropicProvider, openaiProvider];

export function getProvider(id: ProviderId): LlmProvider {
  return PROVIDERS[id];
}
