import React, { useEffect, useState } from 'react';
import { Linking, Platform, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

const PRIVACY_URL = 'https://shayanmohd.github.io/deAIfy/privacy.html';
import { useTheme } from '@/hooks/use-theme';
import { useSettings } from '@/hooks/useSettings';
import { PROVIDER_LIST, getProvider } from '@/llm/registry';
import type { ProviderId } from '@/llm/types';
import { secureKeyStore } from '@/storage/secureKeyStore';
import { Segmented } from './Segmented';
import { Button } from './Button';

export function SettingsForm() {
  const c = useTheme();
  const { settings, update } = useSettings();
  const provider = getProvider(settings.providerId);

  const [keyInput, setKeyInput] = useState('');
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    secureKeyStore.get(settings.providerId).then((k) => {
      if (alive) {
        setSavedKey(k);
        setKeyInput('');
        setStatus(null);
      }
    });
    return () => {
      alive = false;
    };
  }, [settings.providerId]);

  const onProviderChange = (providerId: ProviderId) => {
    update({ providerId, model: getProvider(providerId).defaultModel });
  };

  const onSaveKey = async () => {
    const trimmed = keyInput.trim();
    if (!trimmed) return;
    await secureKeyStore.set(settings.providerId, trimmed, settings.remember);
    setSavedKey(trimmed);
    setKeyInput('');
    setStatus('Key saved.');
  };

  const onClearKey = async () => {
    await secureKeyStore.clear(settings.providerId);
    setSavedKey(null);
    setStatus('Key cleared.');
  };

  return (
    <View style={styles.wrap}>
      <Section title="Provider" c={c}>
        <Segmented
          value={settings.providerId}
          onChange={onProviderChange}
          options={PROVIDER_LIST.map((p) => ({ value: p.id, label: p.label.split(' ')[0] }))}
        />
      </Section>

      <Section title="Model" c={c}>
        <Segmented
          value={settings.model}
          onChange={(model) => update({ model })}
          options={provider.models.map((m) => ({ value: m.id, label: m.label.split(' (')[0] }))}
        />
      </Section>

      <Section title="API key" c={c}>
        <Text style={[styles.hint, { color: c.textSecondary }]}>{provider.keyHint}</Text>
        {savedKey && (
          <Text style={[styles.savedRow, { color: c.text }]}>
            Saved: <Text style={{ fontFamily: Platform.select({ default: undefined }) }}>{mask(savedKey)}</Text>
          </Text>
        )}
        <TextInput
          value={keyInput}
          onChangeText={setKeyInput}
          placeholder={savedKey ? 'Enter a new key to replace' : 'Paste your API key'}
          placeholderTextColor={c.textSecondary}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          style={[styles.input, { color: c.text, backgroundColor: c.backgroundElement, borderColor: c.border }]}
        />
        <View style={styles.switchRow}>
          <Text style={[styles.switchLabel, { color: c.text }]}>Remember on this device</Text>
          <Switch value={settings.remember} onValueChange={(remember) => update({ remember })} />
        </View>
        <View style={styles.actions}>
          <Button label="Save key" onPress={onSaveKey} disabled={!keyInput.trim()} style={styles.flex} />
          {savedKey && <Button label="Clear" variant="danger" onPress={onClearKey} />}
        </View>
        {status && <Text style={[styles.status, { color: c.accent }]}>{status}</Text>}
      </Section>

      <View style={[styles.caveat, { backgroundColor: c.backgroundElement, borderColor: c.border }]}>
        <Text style={[styles.caveatText, { color: c.textSecondary }]}>
          Your key never leaves this device except in requests to {provider.label}.{' '}
          {Platform.OS === 'web'
            ? 'On the web it is stored in this browser only. Anyone with access to this browser (or a malicious extension) could read it.'
            : 'It is stored in the encrypted Android Keystore.'}{' '}
          Use a scoped, spend-limited, revocable key.
        </Text>
      </View>

      <Text
        accessibilityRole="link"
        onPress={() => Linking.openURL(PRIVACY_URL)}
        style={[styles.privacy, { color: c.accent }]}
      >
        Privacy Policy
      </Text>
    </View>
  );
}

function Section({ title, c, children }: { title: string; c: ReturnType<typeof useTheme>; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: c.textSecondary }]}>{title}</Text>
      {children}
    </View>
  );
}

const mask = (k: string) => (k.length <= 8 ? '••••' : `${k.slice(0, 4)}••••${k.slice(-4)}`);

const styles = StyleSheet.create({
  wrap: { gap: 22 },
  section: { gap: 8 },
  sectionTitle: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  hint: { fontSize: 13, lineHeight: 19 },
  savedRow: { fontSize: 14 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11, fontSize: 15 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  switchLabel: { fontSize: 15 },
  actions: { flexDirection: 'row', gap: 10 },
  flex: { flex: 1 },
  status: { fontSize: 13, fontWeight: '600' },
  caveat: { borderRadius: 10, borderWidth: 1, padding: 12 },
  caveatText: { fontSize: 12, lineHeight: 18 },
  privacy: { fontSize: 14, fontWeight: '600', textAlign: 'center', paddingVertical: 8 },
});
