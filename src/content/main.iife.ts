import {
  platformForHostname,
  rewriteUrlForPlatform,
  type Platform,
} from "../shared/platforms";
import {
  isSettings,
  settingKeyForPlatform,
  SETTINGS_MESSAGE_TYPE,
} from "../shared/settings";

interface InterceptorState {
  enabled: boolean;
  installed: boolean;
  platform: Platform;
}

type WindowWithInterceptor = Window & {
  __fxEverythingClipboardV1__?: InterceptorState;
};

const platform = platformForHostname(location.hostname);

if (platform) {
  const pageWindow = window as WindowWithInterceptor;
  const existingState = pageWindow.__fxEverythingClipboardV1__;
  const state: InterceptorState =
    existingState ?? {
      enabled: false,
      installed: false,
      platform,
    };

  state.enabled = false;
  state.platform = platform;
  pageWindow.__fxEverythingClipboardV1__ = state;

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

    if (message.type !== SETTINGS_MESSAGE_TYPE || !isSettings(message.settings)) return;

    state.enabled = message.settings[settingKeyForPlatform(state.platform)];
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
        const wrappedWrite = async function (
          this: Clipboard,
          data: ClipboardItems,
        ): Promise<void> {
          if (!state.enabled) return Reflect.apply(originalWrite, this, [data]);

          const rewritten = await Promise.all(data.map(async (item) => {
            if (!item.types.includes("text/plain")) return item;

            try {
              const text = await (await item.getType("text/plain")).text();
              const output = rewriteUrlForPlatform(text, state.platform);
              if (!output) return item;

              return new ClipboardItem(Object.fromEntries(
                await Promise.all(item.types.map(async (type) => [
                  type,
                  type === "text/plain" ? new Blob([output], { type }) : await item.getType(type),
                ])),
              ));
            } catch {
              return item;
            }
          }));

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
