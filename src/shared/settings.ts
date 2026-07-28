import type { Platform } from "./platforms";

export interface Settings {
  autoFixInstagram: boolean;
  autoFixX: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  autoFixInstagram: true,
  autoFixX: true,
};

export const SETTINGS_MESSAGE_TYPE = "fxeverything:settings:v1";

export function settingKeyForPlatform(platform: Platform): keyof Settings {
  return platform === "x" ? "autoFixX" : "autoFixInstagram";
}

export function isSettings(value: unknown): value is Settings {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<Settings>;
  return (typeof candidate.autoFixX === "boolean" && typeof candidate.autoFixInstagram === "boolean");
}
