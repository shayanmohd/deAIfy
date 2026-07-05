import { useMemo, useState } from 'react';
import { Link } from 'expo-router';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/use-theme';
import { MaxContentWidth } from '@/constants/theme';
import { useSettings } from '@/hooks/useSettings';
import { useDeaify } from '@/hooks/useDeaify';
import { Segmented } from '@/ui/Segmented';
import { CleanupToggles } from '@/ui/CleanupToggles';
import { DiffView } from '@/ui/DiffView';
import { CountChips } from '@/ui/CountChips';
import { CopyButton } from '@/ui/CopyButton';
import { TipsPanel } from '@/ui/TipsPanel';
import { ProControls } from '@/ui/ProControls';

type Mode = 'clean' | 'pro';

const SAMPLE =
  'It’s important to note that we must delve into this rich tapestry of ideas—carefully—to leverage its full potential. Moreover, the results are robust.';

export default function HomeScreen() {
  const c = useTheme();
  const insets = useSafeAreaInsets();
  const { settings, updateCleanup, ready } = useSettings();
  const [mode, setMode] = useState<Mode>('clean');
  const [input, setInput] = useState('');

  const view = useDeaify(input, settings.cleanup);

  const header = useMemo(
    () => (
      <View style={styles.headerRow}>
        <View style={styles.flexShrink}>
          <Text style={[styles.title, { color: c.text }]}>deAIfy</Text>
          <Text style={[styles.subtitle, { color: c.textSecondary }]}>Strip the AI tells out of your text</Text>
        </View>
        <Link href="/settings" asChild>
          {/* Flatten: a child of expo-router's <Slot> (Link asChild) must not receive an
              array style — in production RNW crashes applying it (blanks the app). */}
          <Pressable accessibilityRole="button" style={StyleSheet.flatten([styles.gear, { borderColor: c.border }])}>
            <Text style={[styles.gearText, { color: c.text }]}>Settings</Text>
          </Pressable>
        </Link>
      </View>
    ),
    [c]
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: c.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.inner}>
          {header}

          <Segmented
            value={mode}
            onChange={setMode}
            options={[
              { value: 'clean', label: 'Cleanup (free)' },
              { value: 'pro', label: 'AI rewrite (Pro)' },
            ]}
          />

          <View style={styles.field}>
            <View style={styles.inputHeader}>
              <Text style={[styles.label, { color: c.textSecondary }]}>Paste your text</Text>
              {input.length === 0 ? (
                <Pressable onPress={() => setInput(SAMPLE)}>
                  <Text style={[styles.tryLink, { color: c.accent }]}>Try a sample</Text>
                </Pressable>
              ) : (
                <Pressable onPress={() => setInput('')}>
                  <Text style={[styles.tryLink, { color: c.textSecondary }]}>Clear</Text>
                </Pressable>
              )}
            </View>
            <TextInput
              value={input}
              onChangeText={setInput}
              multiline
              placeholder="Paste text an AI wrote…"
              placeholderTextColor={c.textSecondary}
              style={[styles.input, { color: c.text, backgroundColor: c.backgroundElement, borderColor: c.border }]}
              textAlignVertical="top"
            />
          </View>

          {mode === 'clean' ? (
            <>
              <CleanupToggles cleanup={settings.cleanup} onChange={updateCleanup} />

              <View style={styles.field}>
                <View style={styles.outputHeader}>
                  <Text style={[styles.label, { color: c.textSecondary }]}>Result</Text>
                  <CountChips counts={view.result.counts} />
                </View>
                <View style={[styles.outputBox, { backgroundColor: c.backgroundElement, borderColor: c.border }]}>
                  {input.length === 0 ? (
                    <Text style={[styles.empty, { color: c.textSecondary }]}>Cleaned text appears here.</Text>
                  ) : (
                    <DiffView segments={view.diff} />
                  )}
                </View>
                <View style={styles.actions}>
                  <CopyButton text={view.result.text} label="Copy cleaned text" variant="primary" />
                </View>
              </View>
            </>
          ) : (
            <ProControls input={input} />
          )}

          <TipsPanel />

          {!ready && <Text style={[styles.loading, { color: c.textSecondary }]}>Loading settings…</Text>}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, alignItems: 'center' },
  inner: { width: '100%', maxWidth: MaxContentWidth, gap: 18 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  flexShrink: { flexShrink: 1 },
  title: { fontSize: 28, fontWeight: '800' },
  subtitle: { fontSize: 14, marginTop: 2 },
  gear: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7 },
  gearText: { fontSize: 13, fontWeight: '600' },
  field: { gap: 8 },
  inputHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  outputHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  label: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  tryLink: { fontSize: 13, fontWeight: '600' },
  input: { minHeight: 140, borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 15, lineHeight: 22 },
  outputBox: { minHeight: 100, borderWidth: 1, borderRadius: 12, padding: 14, justifyContent: 'flex-start' },
  empty: { fontSize: 14, fontStyle: 'italic' },
  actions: { flexDirection: 'row', gap: 10 },
  loading: { fontSize: 13, textAlign: 'center' },
});
