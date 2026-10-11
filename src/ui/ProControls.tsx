import { useEffect, useReducer, useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import {
  getComped,
  navigateHost,
  readAvgActionCr,
  ZIBBY_COMPED_EVENT,
  ZIBBY_CREDITS_PATH,
  ZIBBY_QUOTE_EVENT,
} from '@zibby-run/app-kit';
import { useTheme } from '@/hooks/use-theme';
import { useSettings } from '@/hooks/useSettings';
import { useLlmRewrite } from '@/hooks/useLlmRewrite';
import { getProvider } from '@/llm/registry';
import { rewriteAction } from '@/llm/zibby';
import { deaify } from '@/deaify';
import { Button } from './Button';
import { CopyButton } from './CopyButton';

interface Props {
  input: string;
}

/** Pro mode: rewrite the text with AI through Zibby, paid with the person's Zibby credits. */
export function ProControls({ input }: Props) {
  const c = useTheme();
  const { settings } = useSettings();
  const { loading, error, errorAction, output, charge, cutOff, rewrite, continuePastCap, cancel, reset } =
    useLlmRewrite();
  const [preClean, setPreClean] = useState(true);
  const quote = useZibbyQuote(rewriteAction(settings.model));

  const model = getProvider(settings.providerId).models.find((m) => m.id === settings.model);
  const asking = errorAction === 'continue';

  const onRewrite = () => {
    reset();
    const source = preClean ? deaify(input, settings.cleanup).text : input;
    rewrite(source, settings.providerId, settings.model);
  };

  return (
    <View style={styles.wrap}>
      <View style={[styles.notice, { backgroundColor: c.backgroundElement, borderColor: c.border }]}>
        <Text style={[styles.noticeText, { color: c.textSecondary }]}>
          Runs on Zibby with{' '}
          <Text style={{ color: c.text, fontWeight: '700' }}>{model?.label.split(' (')[0] ?? settings.model}</Text>.
          Each rewrite uses your Zibby credits. The cleanup stays free.
        </Text>
      </View>

      <View style={styles.switchRow}>
        <Text style={[styles.switchLabel, { color: c.text }]}>Clean before sending (saves tokens)</Text>
        <Switch value={preClean} onValueChange={setPreClean} />
      </View>

      <View style={styles.actions}>
        <Button
          label={loading ? 'Rewriting…' : quote == null ? 'Rewrite with AI' : `Rewrite with AI · ~${quote} cr`}
          onPress={onRewrite}
          loading={loading}
          disabled={!input.trim()}
          style={styles.flex}
        />
        {loading && <Button label="Cancel" variant="secondary" onPress={cancel} />}
      </View>

      {error && (
        <View
          style={[
            styles.banner,
            asking
              ? { backgroundColor: c.backgroundElement, borderColor: c.accent }
              : { backgroundColor: c.removedBg, borderColor: c.danger },
          ]}
        >
          <Text style={[styles.bannerText, { color: asking ? c.text : c.removedText }]}>{error}</Text>
          {/* Links out of the Zibby frame go through its bridge, never an href. */}
          {errorAction === 'top_up' && (
            <Button label="Top up credits" onPress={() => navigateHost(ZIBBY_CREDITS_PATH)} style={styles.bannerAction} />
          )}
          {errorAction === 'sign_in' && (
            <Button label="Sign in" onPress={() => navigateHost('/users/log-in')} style={styles.bannerAction} />
          )}
          {asking && (
            <View style={[styles.actions, styles.bannerAction]}>
              <Button label="Continue" onPress={continuePastCap} style={styles.flex} />
              <Button label="Cancel" variant="secondary" onPress={reset} />
            </View>
          )}
        </View>
      )}

      {output != null && (
        <View style={styles.result}>
          <Text style={[styles.resultLabel, { color: c.textSecondary }]}>AI rewrite, review before using</Text>
          <View style={[styles.outputBox, { backgroundColor: c.backgroundElement, borderColor: c.border }]}>
            <Text style={[styles.outputText, { color: c.text }]} selectable>
              {output}
            </Text>
          </View>
          {cutOff && (
            <Text style={[styles.meta, { color: c.danger }]}>
              The rewrite hit its length limit and may be cut short. Try a shorter text.
            </Text>
          )}
          <Text style={[styles.meta, { color: c.textSecondary }]}>{charge}</Text>
          <CopyButton text={output} label="Copy rewrite" />
        </View>
      )}
    </View>
  );
}

/**
 * Zibby's live estimate for one rewrite, in credits. Null until the Zibby shell sends one,
 * and for a person whose runs are on Zibby (comped), who pays nothing. Both can arrive
 * after the first render, so re-read when they do.
 */
function useZibbyQuote(action: string): number | null {
  const [, repaint] = useReducer((n: number) => n + 1, 0);
  useEffect(() => {
    window.addEventListener(ZIBBY_QUOTE_EVENT, repaint);
    window.addEventListener(ZIBBY_COMPED_EVENT, repaint);
    return () => {
      window.removeEventListener(ZIBBY_QUOTE_EVENT, repaint);
      window.removeEventListener(ZIBBY_COMPED_EVENT, repaint);
    };
  }, []);
  return getComped() ? null : readAvgActionCr(action);
}

const styles = StyleSheet.create({
  wrap: { gap: 14 },
  notice: { borderRadius: 10, borderWidth: 1, padding: 12 },
  noticeText: { fontSize: 13, lineHeight: 19 },
  banner: { borderRadius: 10, borderWidth: 1, padding: 12, gap: 4 },
  bannerText: { fontSize: 14 },
  bannerAction: { marginTop: 8 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  switchLabel: { fontSize: 15, flex: 1, paddingRight: 12 },
  actions: { flexDirection: 'row', gap: 10 },
  flex: { flex: 1 },
  result: { gap: 8 },
  resultLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  outputBox: { borderRadius: 10, borderWidth: 1, padding: 14 },
  outputText: { fontSize: 15, lineHeight: 23 },
  meta: { fontSize: 13 },
});
