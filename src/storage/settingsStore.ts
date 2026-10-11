import AsyncStorage from '@react-native-async-storage/async-storage';
import { getProvider } from '../llm/registry';
import type { ProviderId } from '../llm/types';
import type { DashStyle, FillerMode } from '../deaify/types';

// Preferences. There is no API key to keep: AI rewrites run through Zibby.
export interface AppSettings {
  providerId: ProviderId;
  model: string;
  cleanup: {
    dashes: DashStyle;
    quotes: boolean;
    spaces: boolean;
    fillerWords: FillerMode;
  };
}

export const DEFAULT_SETTINGS: AppSettings = {
  providerId: 'anthropic',
  model: 'claude-haiku-4-5-20251001',
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
    const settings: AppSettings = {
      ...DEFAULT_SETTINGS,
      ...parsed,
      cleanup: { ...DEFAULT_SETTINGS.cleanup, ...parsed.cleanup },
    };
    // A model Zibby doesn't sell (e.g. saved before the move to Zibby) falls back to the default.
    const provider = getProvider(settings.providerId);
    if (!provider.models.some((m) => m.id === settings.model)) settings.model = provider.defaultModel;
    return settings;
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
