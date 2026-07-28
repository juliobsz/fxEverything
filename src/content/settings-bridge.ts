import {
  DEFAULT_SETTINGS,
  SETTINGS_MESSAGE_TYPE,
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
  const stored = await chrome.storage.local.get([
    "autoFixX",
    "autoFixInstagram",
  ]);
  const settings: Settings = {
    autoFixInstagram:
      typeof stored.autoFixInstagram === "boolean"
        ? stored.autoFixInstagram
        : DEFAULT_SETTINGS.autoFixInstagram,
    autoFixX:
      typeof stored.autoFixX === "boolean"
        ? stored.autoFixX
        : DEFAULT_SETTINGS.autoFixX,
  };

  publishSettings(settings);
}

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "local") return;

  if (!changes.autoFixX && !changes.autoFixInstagram) return;

  void loadSettings();
});

void loadSettings();
