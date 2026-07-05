import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import type { ChangeType } from '@/deaify';

const LABELS: Record<ChangeType, [string, string]> = {
  dash: ['dash', 'dashes'],
  quote: ['curly quote', 'curly quotes'],
  space: ['hidden char', 'hidden chars'],
  filler: ['filler word', 'filler words'],
};

interface Props {
  counts: Record<ChangeType, number>;
}

export function CountChips({ counts }: Props) {
  const c = useTheme();
  const entries = (Object.keys(LABELS) as ChangeType[]).filter((k) => counts[k] > 0);
  if (entries.length === 0) return null;
  return (
    <View style={styles.row}>
      {entries.map((k) => {
        const n = counts[k];
        const [one, many] = LABELS[k];
        return (
          <View key={k} style={[styles.chip, { backgroundColor: c.backgroundElement, borderColor: c.border }]}>
            <Text style={[styles.chipText, { color: c.text }]}>
              {n} {n === 1 ? one : many}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, borderWidth: 1 },
  chipText: { fontSize: 12, fontWeight: '600' },
});
