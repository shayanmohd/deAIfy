import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Stores the user's own LLM API key on-device.
//
// SECURITY: the key never leaves the device except in requests to the chosen provider.
// - Native: expo-secure-store → Android Keystore / iOS Keychain (encrypted at rest).
// - Web: SecureStore is NOT supported. We use sessionStorage by default (cleared on tab
//   close) and localStorage only when the user opts into "Remember on this device".
//   Both web stores are PLAINTEXT on the origin and readable by any script/extension.

const keyName = (providerId: string) => `deaify_key_${providerId}`;
const isWeb = Platform.OS === 'web';

// Guard against SSR / non-browser web contexts.
const webStore = (remember: boolean): Storage | null => {
  if (typeof window === 'undefined') return null;
  return remember ? window.localStorage : window.sessionStorage;
};

export const secureKeyStore = {
  async get(providerId: string): Promise<string | null> {
    if (isWeb) {
      return window.localStorage?.getItem(keyName(providerId)) ?? window.sessionStorage?.getItem(keyName(providerId)) ?? null;
    }
    return SecureStore.getItemAsync(keyName(providerId));
  },

  async set(providerId: string, key: string, remember: boolean): Promise<void> {
    if (isWeb) {
      // Move the key to the chosen store and clear the other to avoid stale copies.
      const name = keyName(providerId);
      window.sessionStorage?.removeItem(name);
      window.localStorage?.removeItem(name);
      webStore(remember)?.setItem(name, key);
      return;
    }
    await SecureStore.setItemAsync(keyName(providerId), key);
  },

  async clear(providerId: string): Promise<void> {
    if (isWeb) {
      const name = keyName(providerId);
      window.sessionStorage?.removeItem(name);
      window.localStorage?.removeItem(name);
      return;
    }
    await SecureStore.deleteItemAsync(keyName(providerId));
  },
};
