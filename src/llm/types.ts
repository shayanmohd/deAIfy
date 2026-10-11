export type ProviderId = 'anthropic' | 'openai';

export interface ModelOption {
  id: string;
  label: string;
}

export interface LlmProvider {
  /** Zibby's request format for these models (not necessarily the model's maker). */
  id: ProviderId;
  label: string;
  defaultModel: string;
  /** Model ids from Zibby's catalog. Anything else is refused as unknown_model. */
  models: ModelOption[];
  /** The provider-native request body. Zibby's /api/ai proxy forwards it untouched. */
  payload(input: string, model: string): Record<string, unknown>;
}
