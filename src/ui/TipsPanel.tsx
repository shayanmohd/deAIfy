import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/hooks/use-theme';

const TIPS: { title: string; body: string }[] = [
  { title: 'Vary sentence length', body: 'AI writes in even, medium-length sentences. Mix short punchy lines with longer ones.' },
  { title: 'Cut stock transitions', body: '"Moreover", "furthermore", and "in conclusion" are dead giveaways. Just start the next sentence.' },
  { title: 'Replace inflated words', body: 'Swap "delve", "leverage", "utilize", "robust" for plain words: dig in, use, use, strong.' },
  { title: 'Add concrete detail', body: 'AI stays vague. Add a specific number, name, or example only you would know.' },
  { title: 'Break the parallelism', body: 'Lists of three and mirrored clauses read as machine-made. Make items uneven.' },
  { title: 'Read it aloud', body: 'If it sounds like a press release, rewrite it the way you would actually say it.' },
];

export function TipsPanel() {
  const c = useTheme();
  const [open, setOpen] = useState(false);
  return (
    <View style={[styles.card, { backgroundColor: c.backgroundElement, borderColor: c.border }]}>
      <Pressable onPress={() => setOpen((o) => !o)} style={styles.header} accessibilityRole="button">
        <Text style={[styles.title, { color: c.text }]}>How to de-AIfy reliably</Text>
        <Text style={[styles.chevron, { color: c.textSecondary }]}>{open ? 'Hide' : 'Show'}</Text>
      </Pressable>
      {open && (
        <View style={styles.list}>
          {TIPS.map((t) => (
            <View key={t.title} style={styles.tip}>
              <Text style={[styles.tipTitle, { color: c.text }]}>{t.title}</Text>
              <Text style={[styles.tipBody, { color: c.textSecondary }]}>{t.body}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14 },
  title: { fontSize: 15, fontWeight: '700' },
  chevron: { fontSize: 13, fontWeight: '600' },
  list: { paddingHorizontal: 14, paddingBottom: 14, gap: 12 },
  tip: { gap: 2 },
  tipTitle: { fontSize: 14, fontWeight: '600' },
  tipBody: { fontSize: 13, lineHeight: 19 },
});
