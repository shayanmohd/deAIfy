export type ProviderId = 'anthropic' | 'openai';

export interface ModelOption {
  id: string;
  label: string;
}

export interface LlmConfig {
  providerId: ProviderId;
  apiKey: string;
  model: string;
}

export interface LlmProvider {
  id: ProviderId;
  label: string;
  defaultModel: string;
  models: ModelOption[];
  /** How the user obtains a key, surfaced in Settings. */
  keyHint: string;
  /** Returns ONLY the rewritten text. Throws LlmError on failure. */
  rewrite(input: string, cfg: LlmConfig, signal?: AbortSignal): Promise<string>;
}

export class LlmError extends Error {
  constructor(
    message: string,
    readonly status?: number
  ) {
    super(message);
    this.name = 'LlmError';
  }
}
