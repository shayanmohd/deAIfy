import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/hooks/use-theme';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

interface Props<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function Segmented<T extends string>({ options, value, onChange }: Props<T>) {
  const c = useTheme();
  return (
    <View style={[styles.row, { backgroundColor: c.backgroundElement, borderColor: c.border }]}>
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={[styles.seg, selected && { backgroundColor: c.accent }]}
            accessibilityRole="button"
            accessibilityState={{ selected }}
          >
            <Text style={[styles.label, { color: selected ? c.accentText : c.textSecondary }]}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', borderRadius: 10, borderWidth: 1, padding: 2, gap: 2 },
  seg: { flex: 1, paddingVertical: 7, paddingHorizontal: 8, borderRadius: 8, alignItems: 'center' },
  label: { fontSize: 13, fontWeight: '600' },
});
