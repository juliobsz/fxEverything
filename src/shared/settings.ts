import type { Platform } from "./platforms";

export interface Settings {
  autoFixBluesky: boolean;
  autoFixInstagram: boolean;
  autoFixX: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  autoFixBluesky: true,
  autoFixInstagram: true,
  autoFixX: true,
};

export const SETTINGS_KEYS = [
  "autoFixBluesky",
  "autoFixInstagram",
  "autoFixX",
] as const satisfies readonly (keyof Settings)[];

export const SETTINGS_MESSAGE_TYPE = "fxeverything:settings:v2";

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
  }
}

export function isSettings(value: unknown): value is Settings {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<Settings>;
  return (
    typeof candidate.autoFixBluesky === "boolean"
    && typeof candidate.autoFixInstagram === "boolean"
    && typeof candidate.autoFixX === "boolean"
  );
}
