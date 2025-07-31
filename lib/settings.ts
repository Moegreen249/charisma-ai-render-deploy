import { AIProvider } from "./ai-providers";

interface Settings {
  apiKeys: Record<string, string>;
  selectedModel: string;
  selectedProvider: AIProvider;
  selectedAnalysisTemplate: string;
  notifications?: {
    email: boolean;
    push: boolean;
    sms: boolean;
    newsletter: boolean;
    updates: boolean;
    security: boolean;
  };
  preferences?: {
    theme: string;
    language: string;
    timezone: string;
    autoSave: boolean;
    compactMode: boolean;
  };
}

const SETTINGS_KEY = "charisma-ai-settings";

const defaultSettings: Settings = {
  apiKeys: {},
  selectedModel: "gemini-2.5-flash",
  selectedProvider: "google",
  selectedAnalysisTemplate: "communication-analysis",
  notifications: {
    email: true,
    push: false,
    sms: false,
    newsletter: true,
    updates: true,
    security: true,
  },
  preferences: {
    theme: 'dark',
    language: 'en',
    timezone: 'UTC',
    autoSave: true,
    compactMode: false,
  },
};

// Cache for settings to avoid repeated API calls
let settingsCache: Settings | null = null;

export async function getSettings(): Promise<Settings> {
  if (typeof window === "undefined") {
    return defaultSettings;
  }

  // Return cached settings if available
  if (settingsCache) {
    return settingsCache;
  }

  try {
    // Try to fetch from database first
    const response = await fetch('/api/user/settings');
    if (response.ok) {
      const dbSettings = await response.json();
      const settings = { ...defaultSettings, ...dbSettings };
      settingsCache = settings;
      return settings;
    }
  } catch (error) {
    console.error("Failed to load settings from database:", error);
  }

  // Fallback to localStorage
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      const localSettings = { ...defaultSettings, ...JSON.parse(stored) };
      settingsCache = localSettings;
      return localSettings;
    }
  } catch (error) {
    console.error("Failed to load settings from localStorage:", error);
  }

  settingsCache = defaultSettings;
  return defaultSettings;
}

export async function saveSettings(settings: Partial<Settings>): Promise<void> {
  if (typeof window === "undefined") {
    return;
  }

  try {
    // Update cache
    const current = await getSettings();
    const updated = { ...current, ...settings };
    settingsCache = updated;

    // Save to database
    const response = await fetch('/api/user/settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      throw new Error('Failed to save to database');
    }

    // Also save to localStorage as backup
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to save settings:", error);
    
    // Fallback to localStorage only
    try {
      const current = await getSettings();
      const updated = { ...current, ...settings };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
      settingsCache = updated;
    } catch (localError) {
      console.error("Failed to save settings to localStorage:", localError);
    }
  }
}

// Clear cache when needed
export function clearSettingsCache(): void {
  settingsCache = null;
}

export async function getApiKey(keyName: string): Promise<string | undefined> {
  const settings = await getSettings();
  return settings.apiKeys[keyName];
}

export async function setApiKey(keyName: string, value: string): Promise<void> {
  const settings = await getSettings();
  await saveSettings({
    apiKeys: {
      ...settings.apiKeys,
      [keyName]: value,
    },
  });
}

export async function clearApiKey(keyName: string): Promise<void> {
  const settings = await getSettings();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { [keyName]: _, ...rest } = settings.apiKeys;
  await saveSettings({
    apiKeys: rest,
  });
}

export async function getSelectedModel(): Promise<{ provider: AIProvider; modelId: string }> {
  const settings = await getSettings();
  return {
    provider: settings.selectedProvider,
    modelId: settings.selectedModel,
  };
}

export async function setSelectedModel(provider: AIProvider, modelId: string): Promise<void> {
  await saveSettings({
    selectedProvider: provider,
    selectedModel: modelId,
  });
}

export async function getSelectedAnalysisTemplate(): Promise<string> {
  const settings = await getSettings();
  return settings.selectedAnalysisTemplate;
}

export async function setSelectedAnalysisTemplate(templateId: string): Promise<void> {
  await saveSettings({
    selectedAnalysisTemplate: templateId,
  });
}

export async function saveNotificationSettings(notifications: Partial<Settings['notifications']>): Promise<void> {
  await saveSettings({ notifications: notifications as Settings['notifications'] });
}

export async function savePreferences(preferences: Partial<Settings['preferences']>): Promise<void> {
  await saveSettings({ preferences: preferences as Settings['preferences'] });
}
