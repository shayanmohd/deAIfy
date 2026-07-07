import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ProviderId } from '../llm/types';
import type { DashStyle, FillerMode } from '../deaify/types';

// Non-secret preferences (NOT the API key, which lives in secureKeyStore).
export interface AppSettings {
  providerId: ProviderId;
  model: string;
  remember: boolean;
  cleanup: {
    dashes: DashStyle;
    quotes: boolean;
    spaces: boolean;
    fillerWords: FillerMode;
  };
}

export const DEFAULT_SETTINGS: AppSettings = {
  providerId: 'anthropic',
  model: 'claude-haiku-4-5',
  remember: false,
  cleanup: {
    dashes: 'spacedHyphen',
    quotes: true,
    spaces: true,
    fillerWords: 'flag',
  },
};

const SETTINGS_KEY = 'deaify_settings_v1';

export async function loadSettings(): Promise<AppSettings> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      cleanup: { ...DEFAULT_SETTINGS.cleanup, ...parsed.cleanup },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Non-fatal: settings simply won't persist this session.
  }
}
