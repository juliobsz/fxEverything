export type Platform =
  | "x"
  | "instagram"
  | "bluesky"
  | "tiktok"
  | "twitch"
  | "tumblr"
  | "pixiv"
  | "pinterest"
  | "youtube"
  | "bilibili"
  | "deviantart"
  | "facebook"
  | "reddit"
  | "threads";

export interface RewrittenLink {
  fixedUrl: string;
  platform: Platform;
}

export interface PlatformInfo {
  id: Platform;
  /** Human-readable platform name. */
  name: string;
  /** What kinds of posts are fixed, shown in the popup. */
  covers: string;
  /** Embed service domain that Fixed Links point to. */
  service: string;
  /** Brand accent used for the popup's platform glyph. */
  color: string;
  /** Chrome match patterns for pages where this platform runs. */
  matches: readonly string[];
}

const FIXEMBED = "fixembed.app";

export const PLATFORMS: readonly PlatformInfo[] = [
  {
    id: "x",
    name: "X / Twitter",
    covers: "Posts",
    service: "fixupx.com",
    color: "#0f1419",
    matches: [
      "https://x.com/*",
      "https://www.x.com/*",
      "https://mobile.x.com/*",
      "https://twitter.com/*",
      "https://www.twitter.com/*",
      "https://mobile.twitter.com/*",
    ],
  },
  {
    id: "instagram",
    name: "Instagram",
    covers: "Posts & reels",
    service: "oginstagram.com",
    color: "#e1306c",
    matches: ["https://instagram.com/*", "https://www.instagram.com/*"],
  },
  {
    id: "bluesky",
    name: "Bluesky",
    covers: "Posts",
    service: "fxbsky.app",
    color: "#0a7aff",
    matches: ["https://bsky.app/*"],
  },
  {
    id: "tiktok",
    name: "TikTok",
    covers: "Videos & photos",
    service: "tnktok.com",
    color: "#111111",
    matches: [
      "https://tiktok.com/*",
      "https://www.tiktok.com/*",
      "https://m.tiktok.com/*",
    ],
  },
  {
    id: "reddit",
    name: "Reddit",
    covers: "Posts & share links",
    service: "vxreddit.com",
    color: "#ff4500",
    matches: ["https://reddit.com/*", "https://www.reddit.com/*"],
  },
  {
    id: "threads",
    name: "Threads",
    covers: "Posts",
    service: "vxthreads.com",
    color: "#101010",
    matches: [
      "https://threads.com/*",
      "https://www.threads.com/*",
      "https://threads.net/*",
      "https://www.threads.net/*",
    ],
  },
  {
    id: "facebook",
    name: "Facebook",
    covers: "Posts & reels",
    service: "facebed.com",
    color: "#1877f2",
    matches: [
      "https://facebook.com/*",
      "https://www.facebook.com/*",
      "https://m.facebook.com/*",
      "https://mbasic.facebook.com/*",
    ],
  },
  {
    id: "pixiv",
    name: "Pixiv",
    covers: "Artworks",
    service: "phixiv.net",
    color: "#0096fa",
    matches: ["https://pixiv.net/*", "https://www.pixiv.net/*"],
  },
  {
    id: "tumblr",
    name: "Tumblr",
    covers: "Posts",
    service: "tpmblr.com",
    color: "#36465d",
    matches: [
      "https://tumblr.com/*",
      "https://www.tumblr.com/*",
      "https://*.tumblr.com/*",
    ],
  },
  {
    id: "deviantart",
    name: "DeviantArt",
    covers: "Artworks",
    service: "fixdeviantart.com",
    color: "#05cc47",
    matches: [
      "https://deviantart.com/*",
      "https://www.deviantart.com/*",
      "https://*.deviantart.com/*",
      "https://sta.sh/*",
    ],
  },
  {
    id: "bilibili",
    name: "Bilibili",
    covers: "Videos",
    service: "vxbilibili.com",
    color: "#00a1d6",
    matches: [
      "https://bilibili.com/*",
      "https://www.bilibili.com/*",
      "https://m.bilibili.com/*",
      "https://b23.tv/*",
    ],
  },
  {
    id: "twitch",
    name: "Twitch",
    covers: "Clips",
    service: FIXEMBED,
    color: "#9146ff",
    matches: [
      "https://twitch.tv/*",
      "https://www.twitch.tv/*",
      "https://m.twitch.tv/*",
      "https://clips.twitch.tv/*",
    ],
  },
  {
    id: "pinterest",
    name: "Pinterest",
    covers: "Pins",
    service: FIXEMBED,
    color: "#e60023",
    matches: [
      "https://pinterest.com/*",
      "https://www.pinterest.com/*",
      "https://*.pinterest.com/*",
      "https://pin.it/*",
    ],
  },
  {
    id: "youtube",
    name: "YouTube",
    covers: "Community posts",
    service: FIXEMBED,
    color: "#ff0000",
    matches: [
      "https://youtube.com/*",
      "https://www.youtube.com/*",
      "https://m.youtube.com/*",
    ],
  },
];

export const SUPPORTED_PAGE_MATCHES: readonly string[] = PLATFORMS.flatMap(
  (platform) => platform.matches,
);

export function platformInfo(platform: Platform): PlatformInfo {
  return PLATFORMS.find((info) => info.id === platform)!;
}

const X_SOURCE_HOSTS = new Set([
  "x.com",
  "www.x.com",
  "mobile.x.com",
  "twitter.com",
  "www.twitter.com",
  "mobile.twitter.com",
]);
const BLUESKY_SOURCE_HOST = "bsky.app";
const TIKTOK_SOURCE_HOSTS = new Set([
  "tiktok.com",
  "www.tiktok.com",
  "m.tiktok.com",
]);
const TWITCH_SOURCE_HOSTS = new Set([
  "twitch.tv",
  "www.twitch.tv",
  "m.twitch.tv",
  "clips.twitch.tv",
]);
const REDDIT_SOURCE_HOSTS = new Set(["reddit.com", "www.reddit.com"]);
const THREADS_SOURCE_HOSTS = new Set([
  "threads.com",
  "www.threads.com",
  "threads.net",
  "www.threads.net",
]);
const INSTAGRAM_SOURCE_HOSTS = new Set(["instagram.com", "www.instagram.com"]);
const PIXIV_SOURCE_HOSTS = new Set(["pixiv.net", "www.pixiv.net"]);
const YOUTUBE_SOURCE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
]);
const BILIBILI_SOURCE_HOSTS = new Set([
  "bilibili.com",
  "www.bilibili.com",
  "m.bilibili.com",
  "b23.tv",
]);
const FACEBOOK_SOURCE_HOSTS = new Set([
  "facebook.com",
  "www.facebook.com",
  "m.facebook.com",
  "mbasic.facebook.com",
]);
const FACEBOOK_RESERVED_ROUTE_NAMES = new Set([
  "events",
  "gaming",
  "groups",
  "help",
  "login",
  "marketplace",
  "permalink.php",
  "photo",
  "photo.php",
  "reel",
  "share",
  "story.php",
  "watch",
]);

function isDeviantArtHostname(hostname: string): boolean {
  return hostname === "deviantart.com"
    || hostname === "www.deviantart.com"
    || hostname === "sta.sh"
    || hostname.endsWith(".deviantart.com");
}

function isTumblrHostname(hostname: string): boolean {
  return hostname === "tumblr.com"
    || hostname === "www.tumblr.com"
    || hostname.endsWith(".tumblr.com");
}

function isPinterestHostname(hostname: string): boolean {
  return hostname === "pinterest.com"
    || hostname === "pin.it"
    || hostname.endsWith(".pinterest.com");
}

export function platformForHostname(hostname: string): Platform | null {
  const normalizedHostname = hostname.toLowerCase();

  if (X_SOURCE_HOSTS.has(normalizedHostname)) return "x";
  if (normalizedHostname === BLUESKY_SOURCE_HOST) return "bluesky";
  if (INSTAGRAM_SOURCE_HOSTS.has(normalizedHostname)) return "instagram";
  if (PIXIV_SOURCE_HOSTS.has(normalizedHostname)) return "pixiv";
  if (isPinterestHostname(normalizedHostname)) return "pinterest";
  if (YOUTUBE_SOURCE_HOSTS.has(normalizedHostname)) return "youtube";
  if (BILIBILI_SOURCE_HOSTS.has(normalizedHostname)) return "bilibili";
  if (isDeviantArtHostname(normalizedHostname)) return "deviantart";
  if (TIKTOK_SOURCE_HOSTS.has(normalizedHostname)) return "tiktok";
  if (FACEBOOK_SOURCE_HOSTS.has(normalizedHostname)) return "facebook";
  if (isTumblrHostname(normalizedHostname)) return "tumblr";
  if (TWITCH_SOURCE_HOSTS.has(normalizedHostname)) return "twitch";
  if (REDDIT_SOURCE_HOSTS.has(normalizedHostname)) return "reddit";
  if (THREADS_SOURCE_HOSTS.has(normalizedHostname)) return "threads";

  return null;
}

function fixEmbedUrl(sourceUrl: string): string {
  const fixedUrl = new URL("https://fixembed.app/embed");
  fixedUrl.searchParams.set("url", sourceUrl);
  return fixedUrl.toString();
}

function rewriteXUrl(url: URL): string | null {
  if (!X_SOURCE_HOSTS.has(url.hostname.toLowerCase())) return null;

  const webStatusMatch = url.pathname.match(
    /^\/i\/(?:web\/)?status\/([0-9]+)(?:\/(?:photo|video)\/[0-9]+)?\/?$/,
  );
  if (webStatusMatch) return `https://fixupx.com/i/status/${webStatusMatch[1]}`;

  const match = url.pathname.match(
    /^\/([A-Za-z0-9_]{1,15})\/status\/([0-9]+)(?:\/(?:photo|video)\/[0-9]+)?\/?$/,
  );

  if (!match) return null;

  const [, username, postId] = match;
  return `https://fixupx.com/${username}/status/${postId}`;
}

function rewriteInstagramUrl(url: URL): string | null {
  if (!INSTAGRAM_SOURCE_HOSTS.has(url.hostname.toLowerCase())) return null;

  // Also accepts profile-scoped links such as /username/p/CODE/ and /username/reel/CODE/.
  const match = url.pathname.match(
    /^\/(?:[A-Za-z0-9._]{1,30}\/)?(p|reel|reels|tv)\/([A-Za-z0-9_-]+)\/?$/,
  );

  if (!match) return null;

  const [, rawContentType, shortcode] = match;
  const contentType = rawContentType === "reels" ? "reel" : rawContentType;
  const fixedUrl = new URL(`https://oginstagram.com/${contentType}/${shortcode}/`);
  const imageIndex = url.searchParams.get("img_index");

  if (imageIndex && /^[1-9][0-9]*$/.test(imageIndex)) fixedUrl.searchParams.set("img_index", imageIndex);

  return fixedUrl.toString();
}

function isBlueskyHandle(actor: string): boolean {
  return actor.length <= 253 && /^([A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?$/.test(actor);
}

function isBlueskyActor(actor: string): boolean {
  if (/^did:plc:[a-z2-7]{24}$/.test(actor)) return true;
  if (actor.startsWith("did:web:")) return isBlueskyHandle(actor.slice("did:web:".length));
  if (actor.startsWith("did:")) return false;

  return isBlueskyHandle(actor);
}

function rewriteBlueskyUrl(url: URL): string | null {
  if (url.hostname.toLowerCase() !== BLUESKY_SOURCE_HOST) return null;

  const match = url.pathname.match(
    /^\/profile\/([^/]+)\/post\/([A-Za-z0-9._:~-]{1,512})\/?$/,
  );

  if (!match) return null;

  const [, actor, recordKey] = match;
  if (!isBlueskyActor(actor) || recordKey === "." || recordKey === "..") return null;

  return `https://fxbsky.app/profile/${actor}/post/${recordKey}`;
}

function rewriteTwitchUrl(url: URL): string | null {
  if (!TWITCH_SOURCE_HOSTS.has(url.hostname.toLowerCase())) return null;

  const clipMatch = url.hostname.toLowerCase() === "clips.twitch.tv"
    ? url.pathname.match(/^\/([A-Za-z0-9_-]{1,100})\/?$/)
    : url.pathname.match(
      /^\/[A-Za-z0-9_]{1,25}\/clip\/([A-Za-z0-9_-]{1,100})\/?$/,
    );

  if (!clipMatch) return null;

  const [, clipSlug] = clipMatch;
  return fixEmbedUrl(`https://clips.twitch.tv/${clipSlug}`);
}

function rewriteTumblrUrl(url: URL): string | null {
  const hostname = url.hostname.toLowerCase();
  if (!isTumblrHostname(hostname)) return null;

  let blogName: string | undefined;
  let postId: string | undefined;

  if (hostname === "tumblr.com" || hostname === "www.tumblr.com") {
    const match = url.pathname.match(
      /^\/(?:blog\/view\/)?([A-Za-z0-9-]{1,64})\/([0-9]{1,30})(?:\/[^/]+)?\/?$/,
    );
    [, blogName, postId] = match ?? [];
  } else {
    const blogMatch = hostname.match(/^([A-Za-z0-9-]{1,64})\.tumblr\.com$/);
    const postMatch = url.pathname.match(/^\/post\/([0-9]{1,30})(?:\/[^/]+)?\/?$/);
    blogName = blogMatch?.[1];
    postId = postMatch?.[1];
  }

  if (!blogName || !postId) return null;
  return `https://www.tpmblr.com/${blogName}/${postId}`;
}

function rewritePixivUrl(url: URL): string | null {
  if (!PIXIV_SOURCE_HOSTS.has(url.hostname.toLowerCase())) return null;

  const artworkMatch = url.pathname.match(
    /^\/(?:[A-Za-z]{2}(?:-[A-Za-z]{2})?\/)?artworks\/([0-9]{1,30})\/?$/,
  );
  let artworkId = artworkMatch?.[1];

  if (!artworkId && url.pathname === "/member_illust.php") {
    const legacyArtworkId = url.searchParams.get("illust_id");
    if (legacyArtworkId && /^[0-9]{1,30}$/.test(legacyArtworkId)) artworkId = legacyArtworkId;
  }

  if (!artworkId) return null;
  return `https://phixiv.net/artworks/${artworkId}`;
}

function rewritePinterestUrl(url: URL): string | null {
  const hostname = url.hostname.toLowerCase();
  if (!isPinterestHostname(hostname)) return null;

  if (hostname === "pin.it") {
    const match = url.pathname.match(/^\/([A-Za-z0-9_-]{2,100})\/?$/);
    if (!match) return null;
    return fixEmbedUrl(`https://pin.it/${match[1]}`);
  }

  const match = url.pathname.match(/^\/pin\/(?:[A-Za-z0-9-]*--)?([0-9]{1,30})\/?$/);
  if (!match) return null;
  return fixEmbedUrl(`https://www.pinterest.com/pin/${match[1]}`);
}

function rewriteYouTubeUrl(url: URL): string | null {
  if (!YOUTUBE_SOURCE_HOSTS.has(url.hostname.toLowerCase())) return null;

  const directMatch = url.pathname.match(/^\/post\/(Ug[A-Za-z0-9_-]{20,100})\/?$/);
  const channelMatch = url.pathname.match(
    /^\/(?:@[^/]+|channel\/[^/]+)\/community$/,
  );
  const postId = directMatch?.[1]
    ?? (channelMatch ? url.searchParams.get("lb") : null);

  if (!postId || !/^Ug[A-Za-z0-9_-]{20,100}$/.test(postId)) return null;
  return fixEmbedUrl(`https://www.youtube.com/post/${postId}`);
}

function rewriteBilibiliUrl(url: URL): string | null {
  const hostname = url.hostname.toLowerCase();
  if (!BILIBILI_SOURCE_HOSTS.has(hostname)) return null;

  if (hostname === "b23.tv") {
    const match = url.pathname.match(/^\/([A-Za-z0-9_-]{2,100})\/?$/);
    if (!match) return null;
    return fixEmbedUrl(`https://b23.tv/${match[1]}`);
  }

  const match = url.pathname.match(/^\/video\/(BV[A-Za-z0-9]{10}|av[0-9]{1,30})\/?$/);
  if (!match) return null;

  const fixedUrl = new URL(`https://vxbilibili.com/video/${match[1]}`);
  const part = url.searchParams.get("p");
  if (part && /^[1-9][0-9]{0,3}$/.test(part)) fixedUrl.searchParams.set("p", part);
  return fixedUrl.toString();
}

function rewriteDeviantArtUrl(url: URL): string | null {
  const hostname = url.hostname.toLowerCase();
  if (!isDeviantArtHostname(hostname)) return null;

  if (hostname === "sta.sh") {
    const match = url.pathname.match(/^\/([A-Za-z0-9_-]{2,100})\/?$/);
    if (!match) return null;
    return fixEmbedUrl(`https://sta.sh/${match[1]}`);
  }

  const modernMatch = hostname === "deviantart.com" || hostname === "www.deviantart.com"
    ? url.pathname.match(/^\/([A-Za-z0-9_-]{1,64})\/art\/([A-Za-z0-9_-]{1,200})\/?$/)
    : null;
  if (modernMatch) {
    const [, artist, artworkSlug] = modernMatch;
    return `https://fixdeviantart.com/${artist}/art/${artworkSlug}`;
  }

  const legacyHostMatch = hostname.match(/^([A-Za-z0-9_-]{1,64})\.deviantart\.com$/);
  const legacyArtworkMatch = url.pathname.match(/^\/art\/([A-Za-z0-9_-]{1,200})\/?$/);
  if (!legacyHostMatch || !legacyArtworkMatch || legacyHostMatch[1] === "www") return null;
  return `https://fixdeviantart.com/${legacyHostMatch[1]}/art/${legacyArtworkMatch[1]}`;
}

function rewriteFacebookUrl(url: URL): string | null {
  const hostname = url.hostname.toLowerCase();
  if (!FACEBOOK_SOURCE_HOSTS.has(hostname)) return null;

  const canonicalPath = url.pathname.replace(/\/+$/, "") || "/";
  const firstSegment = canonicalPath.split("/")[1]?.toLowerCase() ?? "";
  const isUserPost = !FACEBOOK_RESERVED_ROUTE_NAMES.has(firstSegment)
    && /^\/[A-Za-z0-9._-]{1,100}\/posts\/[A-Za-z0-9._-]{2,200}$/.test(canonicalPath);
  // Only URL shapes Facebed documents as supported.
  const directPathPatterns = [
    /^\/reel\/[A-Za-z0-9._-]{2,200}$/,
    /^\/share\/p\/[A-Za-z0-9._-]{2,200}$/,
    /^\/groups\/[A-Za-z0-9._-]{1,200}\/posts\/[A-Za-z0-9._-]{2,200}$/,
  ];

  if (isUserPost || directPathPatterns.some((pattern) => pattern.test(canonicalPath))) {
    return `https://facebed.com${canonicalPath}`;
  }

  if (canonicalPath !== "/permalink.php" && canonicalPath !== "/story.php") return null;

  const storyId = url.searchParams.get("story_fbid");
  const ownerId = url.searchParams.get("id");
  if (!storyId || !/^[A-Za-z0-9._-]{2,200}$/.test(storyId)) return null;
  if (ownerId && !/^[A-Za-z0-9._-]{1,200}$/.test(ownerId)) return null;

  const fixedUrl = new URL(`https://facebed.com${canonicalPath}`);
  fixedUrl.searchParams.set("story_fbid", storyId);
  if (ownerId) fixedUrl.searchParams.set("id", ownerId);
  return fixedUrl.toString();
}

function rewriteTikTokUrl(url: URL): string | null {
  if (!TIKTOK_SOURCE_HOSTS.has(url.hostname.toLowerCase())) return null;

  const match = url.pathname.match(
    /^\/@([A-Za-z0-9._]{1,24})\/(video|photo)\/([0-9]{1,30})\/?$/,
  );

  if (!match) return null;

  const [, username, contentType, postId] = match;
  return `https://tnktok.com/@${username}/${contentType}/${postId}`;
}

function rewriteRedditUrl(url: URL): string | null {
  if (!REDDIT_SOURCE_HOSTS.has(url.hostname.toLowerCase())) return null;

  const isPost = /^\/(?:r|u|user)\/[A-Za-z0-9_-]{2,21}\/comments\/[A-Za-z0-9]+(?:\/[^/?#]+)?(?:\/[A-Za-z0-9]+)?\/?$/.test(url.pathname);
  const isShortPost = /^\/comments\/[A-Za-z0-9]+\/?$/.test(url.pathname);
  const isShareLink = /^\/r\/[A-Za-z0-9_]{2,21}\/s\/[A-Za-z0-9]+\/?$/.test(url.pathname);

  if (!isPost && !isShortPost && !isShareLink) return null;

  return `https://vxreddit.com${url.pathname}`;
}

function rewriteThreadsUrl(url: URL): string | null {
  if (!THREADS_SOURCE_HOSTS.has(url.hostname.toLowerCase())) return null;

  const match = url.pathname.match(
    /^\/@([A-Za-z0-9._]{1,30})\/post\/([A-Za-z0-9_-]+)(?:\/media)?\/?$/,
  );

  if (!match) return null;

  const [, username, shortcode] = match;
  return `https://vxthreads.com/@${username}/post/${shortcode}`;
}

const REWRITERS: Record<Platform, (url: URL) => string | null> = {
  x: rewriteXUrl,
  instagram: rewriteInstagramUrl,
  bluesky: rewriteBlueskyUrl,
  tiktok: rewriteTikTokUrl,
  twitch: rewriteTwitchUrl,
  reddit: rewriteRedditUrl,
  tumblr: rewriteTumblrUrl,
  pixiv: rewritePixivUrl,
  pinterest: rewritePinterestUrl,
  youtube: rewriteYouTubeUrl,
  bilibili: rewriteBilibiliUrl,
  deviantart: rewriteDeviantArtUrl,
  facebook: rewriteFacebookUrl,
  threads: rewriteThreadsUrl,
};

function parseCandidateUrl(input: string): URL | null {
  if (typeof input !== "string") return null;

  // Share buttons sometimes add a trailing newline or spaces; anything with
  // inner whitespace is prose, not a lone link, and is left untouched.
  const trimmed = input.trim();
  if (!trimmed || trimmed.length > 2048 || /\s/.test(trimmed)) return null;

  try {
    const url = new URL(trimmed);
    return url.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}

export function rewriteUrlForPlatform(input: string, platform: Platform): string | null {
  const url = parseCandidateUrl(input);
  if (!url) return null;
  return REWRITERS[platform](url);
}

export function rewriteSupportedUrl(input: string): RewrittenLink | null {
  const url = parseCandidateUrl(input);
  if (!url) return null;

  const platform = platformForHostname(url.hostname);
  if (!platform) return null;

  const fixedUrl = REWRITERS[platform](url);
  return fixedUrl ? { fixedUrl, platform } : null;
}
