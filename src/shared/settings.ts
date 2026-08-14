import type { Platform } from "./platforms";

export interface Settings {
  autoFixBilibili: boolean;
  autoFixDeviantArt: boolean;
  autoFixFacebook: boolean;
  autoFixBluesky: boolean;
  autoFixInstagram: boolean;
  autoFixPixiv: boolean;
  autoFixPinterest: boolean;
  autoFixReddit: boolean;
  autoFixThreads: boolean;
  autoFixTikTok: boolean;
  autoFixTwitch: boolean;
  autoFixTumblr: boolean;
  autoFixYouTube: boolean;
  autoFixX: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  autoFixBilibili: true,
  autoFixDeviantArt: true,
  autoFixFacebook: true,
  autoFixBluesky: true,
  autoFixInstagram: true,
  autoFixPixiv: true,
  autoFixPinterest: true,
  autoFixReddit: true,
  autoFixThreads: true,
  autoFixTikTok: true,
  autoFixTwitch: true,
  autoFixTumblr: true,
  autoFixYouTube: true,
  autoFixX: true,
};

export const SETTINGS_KEYS = [
  "autoFixBilibili",
  "autoFixDeviantArt",
  "autoFixFacebook",
  "autoFixBluesky",
  "autoFixInstagram",
  "autoFixPixiv",
  "autoFixPinterest",
  "autoFixReddit",
  "autoFixThreads",
  "autoFixTikTok",
  "autoFixTwitch",
  "autoFixTumblr",
  "autoFixYouTube",
  "autoFixX",
] as const satisfies readonly (keyof Settings)[];

export const SETTINGS_MESSAGE_TYPE = "fxeverything:settings:v4";

export function settingsFromStorage(
  stored: Partial<Record<keyof Settings, unknown>>,
): Settings {
  return {
    autoFixBilibili:
      typeof stored.autoFixBilibili === "boolean"
        ? stored.autoFixBilibili
        : DEFAULT_SETTINGS.autoFixBilibili,
    autoFixDeviantArt:
      typeof stored.autoFixDeviantArt === "boolean"
        ? stored.autoFixDeviantArt
        : DEFAULT_SETTINGS.autoFixDeviantArt,
    autoFixFacebook:
      typeof stored.autoFixFacebook === "boolean"
        ? stored.autoFixFacebook
        : DEFAULT_SETTINGS.autoFixFacebook,
    autoFixBluesky:
      typeof stored.autoFixBluesky === "boolean"
        ? stored.autoFixBluesky
        : DEFAULT_SETTINGS.autoFixBluesky,
    autoFixInstagram:
      typeof stored.autoFixInstagram === "boolean"
        ? stored.autoFixInstagram
        : DEFAULT_SETTINGS.autoFixInstagram,
    autoFixPixiv:
      typeof stored.autoFixPixiv === "boolean"
        ? stored.autoFixPixiv
        : DEFAULT_SETTINGS.autoFixPixiv,
    autoFixPinterest:
      typeof stored.autoFixPinterest === "boolean"
        ? stored.autoFixPinterest
        : DEFAULT_SETTINGS.autoFixPinterest,
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
    autoFixTwitch:
      typeof stored.autoFixTwitch === "boolean"
        ? stored.autoFixTwitch
        : DEFAULT_SETTINGS.autoFixTwitch,
    autoFixTumblr:
      typeof stored.autoFixTumblr === "boolean"
        ? stored.autoFixTumblr
        : DEFAULT_SETTINGS.autoFixTumblr,
    autoFixYouTube:
      typeof stored.autoFixYouTube === "boolean"
        ? stored.autoFixYouTube
        : DEFAULT_SETTINGS.autoFixYouTube,
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
    case "twitch":
      return "autoFixTwitch";
    case "tumblr":
      return "autoFixTumblr";
    case "youtube":
      return "autoFixYouTube";
    case "pixiv":
      return "autoFixPixiv";
    case "pinterest":
      return "autoFixPinterest";
    case "bilibili":
      return "autoFixBilibili";
    case "deviantart":
      return "autoFixDeviantArt";
    case "facebook":
      return "autoFixFacebook";
    case "reddit":
      return "autoFixReddit";
    case "threads":
      return "autoFixThreads";
  }
}
