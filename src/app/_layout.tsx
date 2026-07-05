import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { SettingsProvider } from '@/hooks/useSettings';

SplashScreen.preventAutoHideAsync();
SplashScreen.hideAsync();

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
