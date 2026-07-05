import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import type { DiffSegment } from '@/deaify';

interface Props {
  segments: DiffSegment[];
}

/** Renders the word-level diff: removed text struck through in red, additions in green. */
export function DiffView({ segments }: Props) {
  const c = useTheme();
  const changed = segments.some((s) => s.added || s.removed);
  if (!changed) {
    return <Text style={[styles.clean, { color: c.textSecondary }]}>No changes — text already looks clean.</Text>;
  }
  return (
    <View style={styles.wrap}>
      <Text style={styles.body}>
        {segments.map((s, i) => {
          if (s.removed) {
            return (
              <Text
                key={i}
                style={[styles.seg, styles.removed, { backgroundColor: c.removedBg, color: c.removedText }]}
              >
                {s.value}
              </Text>
            );
          }
          if (s.added) {
            return (
              <Text key={i} style={[styles.seg, { backgroundColor: c.addedBg, color: c.addedText }]}>
                {s.value}
              </Text>
            );
          }
          return (
            <Text key={i} style={[styles.seg, { color: c.text }]}>
              {s.value}
            </Text>
          );
        })}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap' },
  body: { fontSize: 15, lineHeight: 23 },
  seg: { fontSize: 15, lineHeight: 23 },
  removed: { textDecorationLine: 'line-through' },
  clean: { fontSize: 14, fontStyle: 'italic' },
});
