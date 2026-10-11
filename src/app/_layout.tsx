import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { installHostBridge, setMockLoader } from '@zibby-run/app-kit';

import { SettingsProvider } from '@/hooks/useSettings';

SplashScreen.preventAutoHideAsync();
SplashScreen.hideAsync();

// Zibby App Kit startup (node_modules/@zibby-run/app-kit/AGENTS.md, "The code"). Skipped
// while the static export renders HTML at build time, where there is no window.
if (typeof window !== 'undefined') {
  if (__DEV__) {
    // Local runs: the AI rewrite answers from a canned mock, so nothing is called or charged.
    setMockLoader(() => import('@/llm/mock').then((m) => m.mockStreamZibbyAi));
    const w = window as unknown as { __zibbyAiMock?: unknown };
    if (w.__zibbyAiMock === undefined) w.__zibbyAiMock = true;
  }
  if (__DEV__ && window.parent === window) {
    // A standalone dev page has no Zibby shell to answer the bridge; the kit's mock stands in.
    import('@zibby-run/app-kit/mock').then((m) => m.installMockHostBridge());
  } else {
    // The bridge to the Zibby shell: sign-in token, balance, links out of the frame.
    installHostBridge();
  }
}

export default function RootLayout() {
  // Each screen renders its own header, so the native navigation header is hidden.
  // The navigation ThemeProvider is pinned to the light base theme (our screens do
  // their own dark/light theming via useTheme); the dark navigation theme triggered a
  // react-native-web style crash on this SDK, and the header is invisible anyway.
  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <ThemeProvider value={DefaultTheme}>
          <Stack screenOptions={{ headerShown: false }} />
        </ThemeProvider>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}
