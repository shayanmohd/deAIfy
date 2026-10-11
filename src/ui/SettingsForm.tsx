import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { useSettings } from '@/hooks/useSettings';
import { PROVIDER_LIST, getProvider } from '@/llm/registry';
import type { ProviderId } from '@/llm/types';
import { Segmented } from './Segmented';

export function SettingsForm() {
  const c = useTheme();
  const { settings, update } = useSettings();
  const provider = getProvider(settings.providerId);

  const onProviderChange = (providerId: ProviderId) => {
    update({ providerId, model: getProvider(providerId).defaultModel });
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

const styles = StyleSheet.create({
  wrap: { gap: 22 },
  section: { gap: 8 },
  sectionTitle: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
});
