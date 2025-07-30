import { AIProvider } from "./ai-providers";

interface Settings {
  apiKeys: Record<string, string>;
  selectedModel: string;
  selectedProvider: AIProvider;
  selectedAnalysisTemplate: string;
}

const SETTINGS_KEY = "charisma-ai-settings";

const defaultSettings: Settings = {
  apiKeys: {},
  selectedModel: "gemini-2.5-flash",
  selectedProvider: "google",
  selectedAnalysisTemplate: "communication-analysis",
};

export function getSettings(): Settings {
  if (typeof window === "undefined") {
    return defaultSettings;
  }

  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      return { ...defaultSettings, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error("Failed to load settings:", error);
  }

  return defaultSettings;
}

export function saveSettings(settings: Partial<Settings>): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const current = getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to save settings:", error);
  }
}

export function getApiKey(keyName: string): string | undefined {
  const settings = getSettings();
  return settings.apiKeys[keyName];
}

export function setApiKey(keyName: string, value: string): void {
  const settings = getSettings();
  saveSettings({
    apiKeys: {
      ...settings.apiKeys,
      [keyName]: value,
    },
  });
}

export function clearApiKey(keyName: string): void {
  const settings = getSettings();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { [keyName]: _, ...rest } = settings.apiKeys;
  saveSettings({
    apiKeys: rest,
  });
}

export function getSelectedModel(): { provider: AIProvider; modelId: string } {
  const settings = getSettings();
  return {
    provider: settings.selectedProvider,
    modelId: settings.selectedModel,
  };
}

export function setSelectedModel(provider: AIProvider, modelId: string): void {
  saveSettings({
    selectedProvider: provider,
    selectedModel: modelId,
  });
}

export function getSelectedAnalysisTemplate(): string {
  const settings = getSettings();
  return settings.selectedAnalysisTemplate;
}

export function setSelectedAnalysisTemplate(templateId: string): void {
  saveSettings({
    selectedAnalysisTemplate: templateId,
  });
}
