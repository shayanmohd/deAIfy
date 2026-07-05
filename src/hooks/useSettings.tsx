import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { AppSettings, DEFAULT_SETTINGS, loadSettings, saveSettings } from '@/storage/settingsStore';

interface SettingsContextValue {
  settings: AppSettings;
  ready: boolean;
  update: (patch: Partial<AppSettings>) => void;
  updateCleanup: (patch: Partial<AppSettings['cleanup']>) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    loadSettings().then((s) => {
      if (alive) {
        setSettings(s);
        setReady(true);
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  // Persist on every change once initial load is done.
  useEffect(() => {
    if (ready) saveSettings(settings);
  }, [settings, ready]);

  const value = useMemo<SettingsContextValue>(
    () => ({
      settings,
      ready,
      update: (patch) => setSettings((s) => ({ ...s, ...patch })),
      updateCleanup: (patch) => setSettings((s) => ({ ...s, cleanup: { ...s.cleanup, ...patch } })),
    }),
    [settings, ready]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within a SettingsProvider');
  return ctx;
}
