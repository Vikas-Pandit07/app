import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getPublicSettings } from '../api/settingsService';

const defaultSettings: Record<string, string> = {
  announcement_primary: 'FREE SHIPPING ABOVE ₹999',
  announcement_secondary: 'EASY RETURNS',
  announcement_tertiary: 'SECURE PAYMENTS',
  announcement_quaternary: 'COD AVAILABLE',
  hero_badge: 'Premium Streetwear',
  hero_title_line1: 'Wear Your',
  hero_title_line2: 'Outlook.',
  hero_subtitle: 'Premium streetwear and footwear designed for individuals who create their own path. Minimal branding, maximum impact.',
  footer_email: 'hello@outloox.com',
  footer_phone: '+91 12345 67890',
  footer_city: 'Mumbai, India',
};

interface SettingsContextValue {
  settings: Record<string, string>;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Record<string, string>>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const refreshSettings = async () => {
    try {
      const data = await getPublicSettings();
      setSettings({ ...defaultSettings, ...(data.settings || {}) });
    } catch {
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshSettings();
  }, []);

  const value = useMemo(() => ({ settings, loading, refreshSettings }), [settings, loading]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
}
