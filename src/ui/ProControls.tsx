import { useEffect, useState } from 'react';
import { Link } from 'expo-router';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { useSettings } from '@/hooks/useSettings';
import { useLlmRewrite } from '@/hooks/useLlmRewrite';
import { secureKeyStore } from '@/storage/secureKeyStore';
import { getProvider } from '@/llm/registry';
import { deaify } from '@/deaify';
import { Button } from './Button';
import { CopyButton } from './CopyButton';

interface Props {
  input: string;
}

/** Pro mode: rewrite the text with the user's own LLM key. */
export function ProControls({ input }: Props) {
  const c = useTheme();
  const { settings } = useSettings();
  const { loading, error, output, rewrite, cancel, reset } = useLlmRewrite();
  const [preClean, setPreClean] = useState(true);
  const [hasKey, setHasKey] = useState<boolean | null>(null);

  const provider = getProvider(settings.providerId);

  useEffect(() => {
    let alive = true;
    secureKeyStore.get(settings.providerId).then((k) => alive && setHasKey(!!k));
    return () => {
      alive = false;
    };
  }, [settings.providerId]);

  const onRewrite = () => {
    reset();
    const source = preClean ? deaify(input, settings.cleanup).text : input;
    rewrite(source, settings.providerId, settings.model);
  };

  return (
    <View style={styles.wrap}>
      <View style={[styles.notice, { backgroundColor: c.backgroundElement, borderColor: c.border }]}>
        <Text style={[styles.noticeText, { color: c.textSecondary }]}>
          Uses <Text style={{ color: c.text, fontWeight: '700' }}>your own {provider.label} key</Text>. Requests go
          straight from this device to the provider — no server in between.
        </Text>
      </View>

      {hasKey === false && (
        <View style={[styles.banner, { backgroundColor: c.backgroundElement, borderColor: c.accent }]}>
          <Text style={[styles.bannerText, { color: c.text }]}>No {provider.label} key set.</Text>
          <Link href="/settings" style={[styles.link, { color: c.accent }]}>
            Add one in Settings
          </Link>
        </View>
      )}

      <View style={styles.switchRow}>
        <Text style={[styles.switchLabel, { color: c.text }]}>Clean before sending (saves tokens)</Text>
        <Switch value={preClean} onValueChange={setPreClean} />
      </View>

      <View style={styles.actions}>
        <Button
          label={loading ? 'Rewriting…' : 'Rewrite with AI'}
          onPress={onRewrite}
          loading={loading}
          disabled={!input.trim() || hasKey === false}
          style={styles.flex}
        />
        {loading && <Button label="Cancel" variant="secondary" onPress={cancel} />}
      </View>

      {error && (
        <View style={[styles.banner, { backgroundColor: c.removedBg, borderColor: c.danger }]}>
          <Text style={[styles.bannerText, { color: c.removedText }]}>{error}</Text>
        </View>
      )}

      {output != null && (
        <View style={styles.result}>
          <Text style={[styles.resultLabel, { color: c.textSecondary }]}>AI rewrite — review before using</Text>
          <View style={[styles.outputBox, { backgroundColor: c.backgroundElement, borderColor: c.border }]}>
            <Text style={[styles.outputText, { color: c.text }]} selectable>
              {output}
            </Text>
          </View>
          <CopyButton text={output} label="Copy rewrite" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 14 },
  notice: { borderRadius: 10, borderWidth: 1, padding: 12 },
  noticeText: { fontSize: 13, lineHeight: 19 },
  banner: { borderRadius: 10, borderWidth: 1, padding: 12, gap: 4 },
  bannerText: { fontSize: 14 },
  link: { fontSize: 14, fontWeight: '700' },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  switchLabel: { fontSize: 15, flex: 1, paddingRight: 12 },
  actions: { flexDirection: 'row', gap: 10 },
  flex: { flex: 1 },
  result: { gap: 8 },
  resultLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  outputBox: { borderRadius: 10, borderWidth: 1, padding: 14 },
  outputText: { fontSize: 15, lineHeight: 23 },
});
