import { PLATFORMS, type Platform } from "./platforms";

const PLATFORM_SETTING_KEYS = {
  x: "autoFixX",
  instagram: "autoFixInstagram",
  bluesky: "autoFixBluesky",
  tiktok: "autoFixTikTok",
  twitch: "autoFixTwitch",
  tumblr: "autoFixTumblr",
  pixiv: "autoFixPixiv",
  pinterest: "autoFixPinterest",
  youtube: "autoFixYouTube",
  bilibili: "autoFixBilibili",
  deviantart: "autoFixDeviantArt",
  facebook: "autoFixFacebook",
  reddit: "autoFixReddit",
  threads: "autoFixThreads",
} as const satisfies Record<Platform, string>;

export type PlatformSettingKey = (typeof PLATFORM_SETTING_KEYS)[Platform];

/**
 * Everything is stored flat in chrome.storage.local so settings saved by
 * earlier versions (autoFixX, autoFixInstagram, ...) keep working.
 */
export type Settings = Record<PlatformSettingKey, boolean> & {
  /** Master switch for automatic rewriting of share/copy actions. */
  enabled: boolean;
  /** Show a small on-page confirmation after a link is fixed. */
  showToast: boolean;
};

export type SettingKey = keyof Settings;

export const SETTINGS_KEYS = [
  "enabled",
  "showToast",
  ...PLATFORMS.map((platform) => PLATFORM_SETTING_KEYS[platform.id]),
] as readonly SettingKey[];

export const DEFAULT_SETTINGS: Settings = Object.fromEntries(
  SETTINGS_KEYS.map((key) => [key, true]),
) as Settings;

/** Bridge → page: full settings snapshot. */
export const SETTINGS_MESSAGE_TYPE = "fxeverything:settings:v5";
/** Page → bridge: ask for a fresh snapshot (handshake for load-order races). */
export const SETTINGS_REQUEST_MESSAGE_TYPE = "fxeverything:settings-request:v5";

export function settingsFromStorage(stored: Record<string, unknown>): Settings {
  const settings = { ...DEFAULT_SETTINGS };

  for (const key of SETTINGS_KEYS) {
    const value = stored[key];
    if (typeof value === "boolean") settings[key] = value;
  }

  return settings;
}

export function settingKeyForPlatform(platform: Platform): PlatformSettingKey {
  return PLATFORM_SETTING_KEYS[platform];
}

export function isAutoFixEnabled(settings: Settings, platform: Platform): boolean {
  return settings.enabled && settings[settingKeyForPlatform(platform)];
}
