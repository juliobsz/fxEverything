/**
 * Isolated-world bridge: the MAIN-world interceptor can't read
 * chrome.storage, so this script forwards settings to it via postMessage.
 */
import {
  SETTINGS_KEYS,
  SETTINGS_MESSAGE_TYPE,
  SETTINGS_REQUEST_MESSAGE_TYPE,
  settingsFromStorage,
} from "../shared/settings";
import { t } from "../shared/i18n";

// The MAIN-world script has no chrome.i18n, so its few strings travel with
// the settings.
const strings = { copied: t("toastCopied"), undo: t("toastUndo") };

async function publishSettings(): Promise<void> {
  try {
    const stored = await chrome.storage.local.get([...SETTINGS_KEYS]);
    window.postMessage(
      { type: SETTINGS_MESSAGE_TYPE, settings: settingsFromStorage(stored), strings },
      location.origin,
    );
  } catch {
    // The extension was reloaded or updated; this copy of the bridge is
    // orphaned. The service worker injects a fresh one into open tabs.
  }
}

window.addEventListener("message", (event: MessageEvent<unknown>) => {
  if (event.source !== window || event.origin !== location.origin) return;
  const message = event.data as { type?: unknown } | null;
  if (message?.type === SETTINGS_REQUEST_MESSAGE_TYPE) void publishSettings();
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "local") return;
  if (!SETTINGS_KEYS.some((key) => key in changes)) return;
  void publishSettings();
});

void publishSettings();
