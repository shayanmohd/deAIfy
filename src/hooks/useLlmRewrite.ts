import { useCallback, useRef, useState } from 'react';
import { getProvider } from '@/llm/registry';
import { LlmError, type LlmConfig } from '@/llm/types';
import { secureKeyStore } from '@/storage/secureKeyStore';

export interface RewriteState {
  loading: boolean;
  error: string | null;
  output: string | null;
}

const redactKey = (msg: string, key: string) =>
  key ? msg.split(key).join('•••') : msg;

/**
 * Drives a bring-your-own-key LLM rewrite. Loads the key from secure storage, calls the
 * chosen provider directly, and surfaces friendly (key-redacted) errors. Supports cancel.
 */
export function useLlmRewrite() {
  const [state, setState] = useState<RewriteState>({ loading: false, error: null, output: null });
  const abortRef = useRef<AbortController | null>(null);

  const rewrite = useCallback(
    async (input: string, providerId: LlmConfig['providerId'], model: string) => {
      if (!input.trim()) {
        setState({ loading: false, error: 'Nothing to rewrite.', output: null });
        return;
      }
      const apiKey = (await secureKeyStore.get(providerId)) ?? '';
      if (!apiKey) {
        setState({ loading: false, error: 'No API key set. Add one in Settings.', output: null });
        return;
      }

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setState({ loading: true, error: null, output: null });

      try {
        const provider = getProvider(providerId);
        const text = await provider.rewrite(input, { providerId, apiKey, model }, controller.signal);
        if (!controller.signal.aborted) setState({ loading: false, error: null, output: text });
      } catch (e) {
        if (controller.signal.aborted) return;
        const raw = e instanceof LlmError ? e.message : `Unexpected error: ${(e as Error).message}`;
        setState({ loading: false, error: redactKey(raw, apiKey), output: null });
      }
    },
    []
  );

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setState((s) => ({ ...s, loading: false }));
  }, []);

  const reset = useCallback(() => setState({ loading: false, error: null, output: null }), []);

  return { ...state, rewrite, cancel, reset };
}
