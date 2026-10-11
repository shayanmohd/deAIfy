import { useCallback, useRef, useState } from 'react';
import { publishBalance, streamZibbyAi, ZibbyAiError, type ZibbyRequest } from '@zibby-run/app-kit';
import { chargeLine, errorNotice, rewriteRequest, type NoticeAction } from '@/llm/zibby';
import type { ProviderId } from '@/llm/types';

export interface RewriteState {
  loading: boolean;
  error: string | null;
  /** What the person can do about `error`: top up, sign in, or go past the session cap. */
  errorAction: NoticeAction | null;
  output: string | null;
  /** What the run behind `output` cost, from Zibby's terminal frame. */
  charge: string | null;
  /** The answer hit its output limit and may be cut short. */
  cutOff: boolean;
}

const IDLE: RewriteState = { loading: false, error: null, errorAction: null, output: null, charge: null, cutOff: false };

/**
 * Drives the AI rewrite through Zibby. There is no API key: Zibby bills the signed-in
 * person's credits. Surfaces Zibby's refusals in the app's words. Supports cancel, and the
 * session-cap retry, which must resend the identical request.
 */
export function useLlmRewrite() {
  const [state, setState] = useState<RewriteState>(IDLE);
  const abortRef = useRef<AbortController | null>(null);
  const lastRef = useRef<ZibbyRequest | null>(null);

  const send = useCallback(async (request: ZibbyRequest, capAck: boolean) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    lastRef.current = request;
    setState({ ...IDLE, loading: true });

    try {
      const result = await streamZibbyAi(request, { capAck, signal: controller.signal });
      if (controller.signal.aborted) return;
      if (result.terminal) publishBalance(result.terminal.balance_cr);
      const charge = chargeLine(result.terminal, result.requestId);
      const text = result.text.trim();
      if (!text) {
        setState({ ...IDLE, error: `The model sent nothing back. ${charge}` });
        return;
      }
      const cutOff = result.stopReason === 'max_tokens' || result.stopReason === 'length';
      setState({ ...IDLE, output: text, charge, cutOff });
    } catch (e) {
      if (controller.signal.aborted) return;
      if (e instanceof ZibbyAiError) {
        const { message, action } = errorNotice(e, request.model);
        setState({ ...IDLE, error: message, errorAction: action ?? null });
      } else {
        setState({ ...IDLE, error: `Unexpected error: ${(e as Error).message}` });
      }
    }
  }, []);

  const rewrite = useCallback(
    (input: string, providerId: ProviderId, model: string) => {
      if (!input.trim()) {
        setState({ ...IDLE, error: 'Nothing to rewrite.' });
        return;
      }
      send(rewriteRequest(input, providerId, model), false);
    },
    [send]
  );

  /** The person chose to go past the session cap: resend the same request, acknowledged. */
  const continuePastCap = useCallback(() => {
    if (lastRef.current) send(lastRef.current, true);
  }, [send]);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setState((s) => ({ ...s, loading: false }));
  }, []);

  const reset = useCallback(() => setState(IDLE), []);

  return { ...state, rewrite, continuePastCap, cancel, reset };
}
