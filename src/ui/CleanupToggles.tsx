import { StyleSheet, Switch, Text, View } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import type { AppSettings } from '@/storage/settingsStore';
import { Segmented } from './Segmented';

interface Props {
  cleanup: AppSettings['cleanup'];
  onChange: (patch: Partial<AppSettings['cleanup']>) => void;
}

export function CleanupToggles({ cleanup, onChange }: Props) {
  const c = useTheme();
  return (
    <View style={styles.wrap}>
      <View style={styles.field}>
        <Text style={[styles.label, { color: c.textSecondary }]}>Dashes</Text>
        <Segmented
          value={cleanup.dashes}
          onChange={(dashes) => onChange({ dashes })}
          options={[
            { value: 'spacedHyphen', label: ' - ' },
            { value: 'comma', label: ', ' },
            { value: 'hyphen', label: '-' },
            { value: 'off', label: 'Off' },
          ]}
        />
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: c.textSecondary }]}>Filler words</Text>
        <Segmented
          value={cleanup.fillerWords}
          onChange={(fillerWords) => onChange({ fillerWords })}
          options={[
            { value: 'flag', label: 'Flag' },
            { value: 'soften', label: 'Soften' },
            { value: 'off', label: 'Off' },
          ]}
        />
      </View>

      <View style={styles.switchRow}>
        <Text style={[styles.switchLabel, { color: c.text }]}>Straighten curly quotes</Text>
        <Switch value={cleanup.quotes} onValueChange={(quotes) => onChange({ quotes })} />
      </View>
      <View style={styles.switchRow}>
        <Text style={[styles.switchLabel, { color: c.text }]}>Remove hidden characters</Text>
        <Switch value={cleanup.spaces} onValueChange={(spaces) => onChange({ spaces })} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 14 },
  field: { gap: 6 },
  label: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  switchLabel: { fontSize: 15 },
});
