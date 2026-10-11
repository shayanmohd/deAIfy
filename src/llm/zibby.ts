import { ZIBBY_COMPED_LINE, type ZibbyAiError, type ZibbyRequest, type ZibbyTerminal } from '@zibby-run/app-kit';
import { getProvider } from './registry';
import type { ProviderId } from './types';

// The AI rewrite runs through Zibby: one streamZibbyAi request to Zibby's same-origin
// /api/ai, billed to the signed-in person's credits. The app holds no key. The wording
// rules below are the Zibby App Kit's (node_modules/@zibby-run/app-kit/CONTRACT.md §2-§6).

/** One rewrite. The action label names the model, so Zibby's per-action estimate fits it. */
export function rewriteRequest(input: string, providerId: ProviderId, model: string): ZibbyRequest {
  return {
    action: rewriteAction(model),
    provider: providerId,
    model,
    payload: getProvider(providerId).payload(input, model),
  };
}

export const rewriteAction = (model: string) => `rewrite:${model}`;

/** The only sentence about money after a run: the terminal frame's figure, never an estimate. */
export function chargeLine(terminal: ZibbyTerminal | null, requestId: string | null): string {
  if (!terminal) return requestId ? `Charge unknown. Request id ${requestId}.` : 'Charge unknown.';
  if (terminal.comped) return `${ZIBBY_COMPED_LINE}.`;
  if (terminal.charged_cr === 0) return 'Nothing was charged.';
  return `Charged ${terminal.charged_cr} ${terminal.charged_cr === 1 ? 'credit' : 'credits'}.`;
}

export type NoticeAction = 'top_up' | 'sign_in' | 'continue';

/** A refusal or failure from Zibby in this app's words, and what the person can do next. */
export function errorNotice(error: ZibbyAiError, model: string): { message: string; action?: NoticeAction } {
  const id = error.requestId ? ` Request id ${error.requestId}.` : '';
  const { balance_cr: balance, spent_cr: spent, cap_cr: cap, comped } = error.details;
  switch (error.code) {
    case 'insufficient_credits':
      return {
        message: `Not enough Zibby credits for this rewrite.${typeof balance === 'number' ? ` Your balance is ${balance}.` : ''}`,
        action: 'top_up',
      };
    case 'session_cap_reached':
      // The cap applies to a comped person too; ask them without money.
      return {
        message:
          comped === true
            ? 'This app has run a lot in a short time. Continue?'
            : typeof spent === 'number' && typeof cap === 'number'
              ? `You have spent ${spent} credits this session, which is the cap of ${cap}. Continue?`
              : "You have reached this session's spending cap. Continue?",
        action: 'continue',
      };
    case 'unauthenticated':
      return { message: 'Sign in to Zibby to use the AI rewrite.', action: 'sign_in' };
    case 'locked':
      return { message: 'Your Zibby account is on hold, so the rewrite could not run. Check your Zibby account.' };
    case 'rate_limited':
      return { message: 'Too many requests just now. Wait a moment and try again.' };
    case 'unknown_model':
      return { message: `Zibby does not offer ${model} right now. Pick another model in Settings. Nothing was charged.` };
    case 'payload_too_large':
      return { message: 'That text is too long to send. Try a shorter piece.' };
    case 'network':
      return { message: `The connection to the AI service dropped.${id}` };
    default:
      return { message: `${error.message}${id}` };
  }
}
