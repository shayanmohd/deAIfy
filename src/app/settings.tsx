import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/use-theme';
import { MaxContentWidth } from '@/constants/theme';
import { SettingsForm } from '@/ui/SettingsForm';

export default function SettingsScreen() {
  const c = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/'));

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <View style={[styles.header, { paddingTop: insets.top + 10, borderColor: c.border }]}>
        <View style={styles.headerInner}>
          <Pressable onPress={goBack} accessibilityRole="button" hitSlop={8} style={styles.back}>
            <Text style={[styles.backText, { color: c.accent }]}>‹ Back</Text>
          </Pressable>
          <Text style={[styles.title, { color: c.text }]}>Settings</Text>
          <View style={styles.back} />
        </View>
      </View>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.inner}>
          <SettingsForm />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { borderBottomWidth: StyleSheet.hairlineWidth, paddingBottom: 10, paddingHorizontal: 16 },
  headerInner: { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { minWidth: 60 },
  backText: { fontSize: 16, fontWeight: '600' },
  title: { fontSize: 17, fontWeight: '700' },
  content: { padding: 16, alignItems: 'center' },
  inner: { width: '100%', maxWidth: MaxContentWidth },
});
