import type { Platform } from "./platforms";

export interface Settings {
  autoFixBluesky: boolean;
  autoFixInstagram: boolean;
  autoFixReddit: boolean;
  autoFixThreads: boolean;
  autoFixTikTok: boolean;
  autoFixX: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  autoFixBluesky: true,
  autoFixInstagram: true,
  autoFixReddit: true,
  autoFixThreads: true,
  autoFixTikTok: true,
  autoFixX: true,
};

export const SETTINGS_KEYS = [
  "autoFixBluesky",
  "autoFixInstagram",
  "autoFixReddit",
  "autoFixThreads",
  "autoFixTikTok",
  "autoFixX",
] as const satisfies readonly (keyof Settings)[];

export const SETTINGS_MESSAGE_TYPE = "fxeverything:settings:v3";

export function settingsFromStorage(
  stored: Partial<Record<keyof Settings, unknown>>,
): Settings {
  return {
    autoFixBluesky:
      typeof stored.autoFixBluesky === "boolean"
        ? stored.autoFixBluesky
        : DEFAULT_SETTINGS.autoFixBluesky,
    autoFixInstagram:
      typeof stored.autoFixInstagram === "boolean"
        ? stored.autoFixInstagram
        : DEFAULT_SETTINGS.autoFixInstagram,
    autoFixReddit:
      typeof stored.autoFixReddit === "boolean"
        ? stored.autoFixReddit
        : DEFAULT_SETTINGS.autoFixReddit,
    autoFixThreads:
      typeof stored.autoFixThreads === "boolean"
        ? stored.autoFixThreads
        : DEFAULT_SETTINGS.autoFixThreads,
    autoFixTikTok:
      typeof stored.autoFixTikTok === "boolean"
        ? stored.autoFixTikTok
        : DEFAULT_SETTINGS.autoFixTikTok,
    autoFixX:
      typeof stored.autoFixX === "boolean"
        ? stored.autoFixX
        : DEFAULT_SETTINGS.autoFixX,
  };
}

export function settingKeyForPlatform(platform: Platform): keyof Settings {
  switch (platform) {
    case "x":
      return "autoFixX";
    case "instagram":
      return "autoFixInstagram";
    case "bluesky":
      return "autoFixBluesky";
    case "tiktok":
      return "autoFixTikTok";
    case "reddit":
      return "autoFixReddit";
    case "threads":
      return "autoFixThreads";
  }
}
