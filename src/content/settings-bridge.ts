import {
  SETTINGS_KEYS,
  SETTINGS_MESSAGE_TYPE,
  settingsFromStorage,
  type Settings,
} from "../shared/settings";

function publishSettings(settings: Settings): void {
  window.postMessage(
    {
      type: SETTINGS_MESSAGE_TYPE,
      settings,
    },
    location.origin,
  );
}

async function loadSettings(): Promise<void> {
  const stored = await chrome.storage.local.get([...SETTINGS_KEYS]);
  const settings = settingsFromStorage(stored);

  publishSettings(settings);
}

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "local") return;

  if (!SETTINGS_KEYS.some((key) => changes[key])) return;

  void loadSettings();
});

void loadSettings();
