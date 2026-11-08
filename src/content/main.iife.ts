/**
 * Runs in the page's MAIN world so it can wrap the page's own clipboard calls
 * (navigator.clipboard.writeText / write) and copy events triggered by
 * "Copy link" buttons.
 *
 * Design notes:
 * - Starts with default settings (everything on) instead of "disabled until
 *   told otherwise", so a slow or lost settings message never leaves the tab
 *   silently broken until a refresh.
 * - Asks the isolated-world bridge for settings on start (handshake), so the
 *   result doesn't depend on which content script runs first.
 * - Safe to inject more than once (the service worker re-injects into open
 *   tabs after install/update): prototype patches and listeners are installed
 *   once and delegate to the latest runtime object.
 */
import {
  platformForHostname,
  platformInfo,
  rewriteUrlForPlatform,
  type Platform,
} from "../shared/platforms";
import {
  DEFAULT_SETTINGS,
  isAutoFixEnabled,
  SETTINGS_MESSAGE_TYPE,
  SETTINGS_REQUEST_MESSAGE_TYPE,
  settingsFromStorage,
  type Settings,
} from "../shared/settings";
import { showToast } from "../shared/toast";

type WriteText = (this: Clipboard, data: string) => Promise<void>;
type Write = (this: Clipboard, data: ClipboardItems) => Promise<void>;

interface Strings {
  copied: string;
  undo: string;
}

const DEFAULT_STRINGS: Strings = { copied: "Fixed link copied", undo: "Undo" };

interface Runtime {
  platform: Platform;
  settings: Settings;
  /** Translated by the bridge (chrome.i18n isn't available in this world). */
  strings: Strings;
  /** Returns the Fixed Link for text, or null when it should stay as-is. */
  fix(text: unknown): string | null;
  /** Called after the clipboard received a Fixed Link. */
  fixed(original: string, fixedUrl: string): void;
}

interface Installation {
  runtime: Runtime;
  originalWriteText?: WriteText;
  originalWrite?: Write;
}

type PageWindow = Window & {
  __fxEverything__?: Installation;
  /** State object used by v1.x; disabled so it can't double-handle copies. */
  __fxEverythingClipboardV3__?: { enabled: boolean };
};

const pageWindow = window as PageWindow;
const platform = platformForHostname(location.hostname);

if (platform) {
  if (pageWindow.__fxEverythingClipboardV3__) {
    pageWindow.__fxEverythingClipboardV3__.enabled = false;
  }

  const previous = pageWindow.__fxEverything__;

  const runtime: Runtime = {
    platform,
    settings: previous?.runtime.settings ?? { ...DEFAULT_SETTINGS },
    strings: previous?.runtime.strings ?? { ...DEFAULT_STRINGS },
    fix(text) {
      if (typeof text !== "string") return null;
      if (!isAutoFixEnabled(this.settings, this.platform)) return null;
      try {
        return rewriteUrlForPlatform(text, this.platform);
      } catch {
        return null;
      }
    },
    fixed(original, fixedUrl) {
      if (!this.settings.showToast) return;
      const writeText = installation.originalWriteText;
      try {
        showToast({
          title: this.strings.copied,
          detail: `${platformInfo(this.platform).name} → ${new URL(fixedUrl).hostname}`,
          actionLabel: writeText ? this.strings.undo : undefined,
          onAction: writeText
            ? () => void Reflect.apply(writeText, navigator.clipboard, [original]).catch(() => undefined)
            : undefined,
        });
      } catch {
        // Never let UI feedback break the page's copy flow.
      }
    },
  };

  const installation: Installation = previous ?? { runtime };
  installation.runtime = runtime;
  pageWindow.__fxEverything__ = installation;

  if (!previous) install(installation);

  window.postMessage({ type: SETTINGS_REQUEST_MESSAGE_TYPE }, location.origin);
}

function install(installation: Installation): void {
  const current = () => installation.runtime;

  window.addEventListener("message", (event: MessageEvent<unknown>) => {
    if (event.source !== window || event.origin !== location.origin) return;
    const message = event.data as { type?: unknown; settings?: unknown; strings?: unknown } | null;
    if (!message || typeof message !== "object") return;
    if (message.type !== SETTINGS_MESSAGE_TYPE) return;
    if (!message.settings || typeof message.settings !== "object") return;

    current().settings = settingsFromStorage(message.settings as Record<string, unknown>);

    const strings = message.strings as Partial<Record<keyof Strings, unknown>> | undefined;
    if (strings && typeof strings === "object") {
      for (const key of Object.keys(DEFAULT_STRINGS) as Array<keyof Strings>) {
        const value = strings[key];
        if (typeof value === "string" && value && value.length <= 80) current().strings[key] = value;
      }
    }
  });

  // Copies made with document.execCommand("copy") or Ctrl+C on a selected link.
  // Registered on window in the bubble phase so it runs after the page's own
  // copy handlers and can see data they set.
  window.addEventListener("copy", (event: ClipboardEvent) => {
    const data = event.clipboardData;
    if (!data) return;

    const original = data.getData("text/plain") || selectedText();
    const fixedUrl = current().fix(original);
    if (!fixedUrl) return;

    event.preventDefault();
    data.setData("text/plain", fixedUrl);
    if (data.getData("text/uri-list")) data.setData("text/uri-list", fixedUrl);
    current().fixed(original.trim(), fixedUrl);
  });

  const prototype = globalThis.Clipboard?.prototype;
  if (!prototype) return;

  const writeTextDescriptor = Object.getOwnPropertyDescriptor(prototype, "writeText");
  const originalWriteText = writeTextDescriptor?.value as WriteText | undefined;
  if (writeTextDescriptor && typeof originalWriteText === "function") {
    installation.originalWriteText = originalWriteText;
    const writeText = function (this: Clipboard, data: string): Promise<void> {
      const fixedUrl = current().fix(data);
      if (!fixedUrl) return Reflect.apply(originalWriteText, this, [data]);

      const result = Reflect.apply(originalWriteText, this, [fixedUrl]) as Promise<void>;
      void result.then(() => current().fixed(String(data).trim(), fixedUrl), () => undefined);
      return result;
    };
    try {
      Object.defineProperty(prototype, "writeText", { ...writeTextDescriptor, value: writeText });
    } catch {
      // Leave the platform's original behavior unchanged.
    }
  }

  const writeDescriptor = Object.getOwnPropertyDescriptor(prototype, "write");
  const originalWrite = writeDescriptor?.value as Write | undefined;
  if (writeDescriptor && typeof originalWrite === "function" && typeof ClipboardItem === "function") {
    installation.originalWrite = originalWrite;
    const write = function (this: Clipboard, items: ClipboardItems): Promise<void> {
      if (!Array.isArray(items) || !items.some((item) => item.types.includes("text/plain"))) {
        return Reflect.apply(originalWrite, this, [items]);
      }

      let change: { original: string; fixedUrl: string } | null = null;
      const rewritten = items.map((item) => {
        if (!item.types.includes("text/plain")) return item;

        const entries = item.types.map((type) => {
          const blob = item.getType(type);
          if (type !== "text/plain") return [type, blob] as const;

          return [type, blob.then(async (value) => {
            const original = await value.text();
            const fixedUrl = current().fix(original);
            if (!fixedUrl) return value;
            change = { original: original.trim(), fixedUrl };
            return new Blob([fixedUrl], { type });
          }).catch(() => item.getType(type))] as const;
        });

        return new ClipboardItem(Object.fromEntries(entries));
      });

      const result = Reflect.apply(originalWrite, this, [rewritten]) as Promise<void>;
      void result.then(() => {
        const done = change as { original: string; fixedUrl: string } | null;
        if (done) current().fixed(done.original, done.fixedUrl);
      }, () => undefined);
      return result;
    };
    try {
      Object.defineProperty(prototype, "write", { ...writeDescriptor, value: write });
    } catch {
      // Leave the platform's original behavior unchanged.
    }
  }
}

function selectedText(): string {
  const active = deepActiveElement();
  if (active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement) {
    try {
      return active.value.slice(active.selectionStart ?? 0, active.selectionEnd ?? 0);
    } catch {
      // Some input types (e.g. email) don't expose a selection.
      return "";
    }
  }
  return window.getSelection()?.toString() ?? "";
}

function deepActiveElement(): Element | null {
  let active = document.activeElement;
  while (active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement;
  return active;
}
