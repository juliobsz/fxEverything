import {
  platformForHostname,
  rewriteUrlForPlatform,
  type Platform,
} from "../shared/platforms";
import {
  settingKeyForPlatform,
  SETTINGS_MESSAGE_TYPE,
} from "../shared/settings";

interface InterceptorState {
  enabled: boolean;
  installed: boolean;
  platform: Platform;
}

type WindowWithInterceptor = Window & {
  __fxEverythingClipboardV3__?: InterceptorState;
};

const LEGACY_SETTINGS_MESSAGE_TYPE = "fxeverything:settings:v2";

const platform = platformForHostname(location.hostname);

if (platform) {
  const pageWindow = window as WindowWithInterceptor;
  const existingState = pageWindow.__fxEverythingClipboardV3__;
  const state: InterceptorState =
    existingState ?? {
      enabled: false,
      installed: false,
      platform,
    };

  state.platform = platform;
  pageWindow.__fxEverythingClipboardV3__ = state;

  window.addEventListener("message", (event: MessageEvent<unknown>) => {
    if (
      event.source !== window ||
      event.origin !== location.origin ||
      !event.data ||
      typeof event.data !== "object"
    ) return;

    const message = event.data as {
      settings?: unknown;
      type?: unknown;
    };

    if (
      message.type !== SETTINGS_MESSAGE_TYPE
      && message.type !== LEGACY_SETTINGS_MESSAGE_TYPE
    ) return;

    if (!message.settings || typeof message.settings !== "object") return;

    const settingKey = settingKeyForPlatform(state.platform);
    const enabled = (message.settings as Record<string, unknown>)[settingKey];

    if (typeof enabled !== "boolean") return;

    state.enabled = enabled;
  });

  window.addEventListener("copy", (event: ClipboardEvent) => {
    if (!state.enabled || !event.clipboardData) return;

    const activeElement = document.activeElement;
    const selectedText = activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement
      ? activeElement.value.slice(activeElement.selectionStart ?? 0, activeElement.selectionEnd ?? 0)
      : window.getSelection()?.toString() ?? "";
    const output = rewriteUrlForPlatform(selectedText, state.platform);

    if (!output) return;

    event.preventDefault();
    event.clipboardData.setData("text/plain", output);
  });

  if (!state.installed) {
    const clipboardPrototype = globalThis.Clipboard?.prototype;
    const descriptor = clipboardPrototype
      ? Object.getOwnPropertyDescriptor(clipboardPrototype, "writeText")
      : undefined;
    const originalWriteText = descriptor?.value as
      | ((this: Clipboard, data: string) => Promise<void>)
      | undefined;

    const originalWrite = clipboardPrototype?.write;

    if (clipboardPrototype && (originalWriteText || originalWrite)) {
      if (descriptor && originalWriteText) {
        const wrappedWriteText = function (
          this: Clipboard,
          data: string,
        ): Promise<void> {
          let output = data;

          if (state.enabled && typeof data === "string") {
            try {
              output = rewriteUrlForPlatform(data, state.platform) ?? data;
            } catch {
              output = data;
            }
          }

          return Reflect.apply(originalWriteText, this, [output]);
        };

        try {
          Object.defineProperty(clipboardPrototype, "writeText", {
            ...descriptor,
            value: wrappedWriteText,
          });
          state.installed = true;
        } catch {
          // Try Clipboard.write below.
        }
      }
      if (originalWrite) {
        const wrappedWrite = function (
          this: Clipboard,
          data: ClipboardItems,
        ): Promise<void> {
          if (!state.enabled) return Reflect.apply(originalWrite, this, [data]);

          const rewritten = data.map((item) => {
            if (!item.types.includes("text/plain")) return item;

            const itemData = Object.fromEntries(item.types.map((type) => [
              type,
              type === "text/plain"
                ? item.getType(type).then(async (blob) => {
                    const text = await blob.text();
                    const output = rewriteUrlForPlatform(text, state.platform);
                    return output ? new Blob([output], { type }) : blob;
                  }).catch(() => item.getType(type))
                : item.getType(type),
            ]));

            return new ClipboardItem(itemData);
          });

          return Reflect.apply(originalWrite, this, [rewritten]);
        };
        try {
          clipboardPrototype.write = wrappedWrite;
          state.installed = true;
        } catch {
          // Leave the platform's original copy behavior unchanged.
        }
      }
    }
  }
}
