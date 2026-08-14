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
const REDDIT_SOURCE_HOSTS = new Set([
  "reddit.com",
  "www.reddit.com",
]);
const THREADS_SOURCE_HOSTS = new Set([
  "threads.com",
  "www.threads.com",
  "threads.net",
  "www.threads.net",
]);
const INSTAGRAM_SOURCE_HOSTS = new Set([
  "instagram.com",
  "www.instagram.com",
]);
const PIXIV_SOURCE_HOSTS = new Set([
  "pixiv.net",
  "www.pixiv.net",
]);
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
  if (url.protocol !== "https:" || !X_SOURCE_HOSTS.has(url.hostname.toLowerCase())) return null;

  const webStatusMatch = url.pathname.match(
    /^\/i\/web\/status\/([0-9]+)(?:\/(?:photo|video)\/[0-9]+)?\/?$/,
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
  if (url.protocol !== "https:" || !INSTAGRAM_SOURCE_HOSTS.has(url.hostname.toLowerCase())) return null;

  const match = url.pathname.match(
    /^\/(p|reel|reels)\/([A-Za-z0-9_-]+)\/?$/,
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
  if (url.protocol !== "https:" || url.hostname.toLowerCase() !== BLUESKY_SOURCE_HOST) return null;

  const match = url.pathname.match(
    /^\/profile\/([^/]+)\/post\/([A-Za-z0-9._:~-]{1,512})\/?$/,
  );

  if (!match) return null;

  const [, actor, recordKey] = match;
  if (!isBlueskyActor(actor) || recordKey === "." || recordKey === "..") return null;

  return `https://fxbsky.app/profile/${actor}/post/${recordKey}`;
}

function rewriteTwitchUrl(url: URL): string | null {
  if (url.protocol !== "https:" || !TWITCH_SOURCE_HOSTS.has(url.hostname.toLowerCase())) return null;

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
  if (url.protocol !== "https:" || !isTumblrHostname(hostname)) return null;

  if (hostname === "tumblr.com" || hostname === "www.tumblr.com") {
    const match = url.pathname.match(
      /^\/([A-Za-z0-9-]{1,64})\/([0-9]{1,30})(?:\/[^/]+)?\/?$/,
    );

    if (!match) return null;

    const [, blogName, postId] = match;
    return fixEmbedUrl(`https://www.tumblr.com/${blogName}/${postId}`);
  }

  const blogMatch = hostname.match(/^([A-Za-z0-9-]{1,64})\.tumblr\.com$/);
  const postMatch = url.pathname.match(
    /^\/post\/([0-9]{1,30})(?:\/[^/]+)?\/?$/,
  );

  if (!blogMatch || !postMatch) return null;

  const [, blogName] = blogMatch;
  const [, postId] = postMatch;
  return fixEmbedUrl(`https://www.tumblr.com/${blogName}/${postId}`);
}

function rewritePixivUrl(url: URL): string | null {
  if (url.protocol !== "https:" || !PIXIV_SOURCE_HOSTS.has(url.hostname.toLowerCase())) return null;

  const artworkMatch = url.pathname.match(
    /^\/(?:[A-Za-z]{2}(?:-[A-Za-z]{2})?\/)?artworks\/([0-9]{1,30})\/?$/,
  );
  let artworkId = artworkMatch?.[1];

  if (!artworkId && url.pathname === "/member_illust.php") {
    const legacyArtworkId = url.searchParams.get("illust_id");
    if (legacyArtworkId && /^[0-9]{1,30}$/.test(legacyArtworkId)) artworkId = legacyArtworkId;
  }

  if (!artworkId) return null;
  return fixEmbedUrl(`https://www.pixiv.net/artworks/${artworkId}`);
}

function rewritePinterestUrl(url: URL): string | null {
  const hostname = url.hostname.toLowerCase();
  if (url.protocol !== "https:" || !isPinterestHostname(hostname)) return null;

  if (hostname === "pin.it") {
    const match = url.pathname.match(/^\/([A-Za-z0-9_-]{2,100})\/?$/);
    if (!match) return null;
    return fixEmbedUrl(`https://pin.it/${match[1]}`);
  }

  const match = url.pathname.match(/^\/pin\/([0-9]{1,30})\/?$/);
  if (!match) return null;
  return fixEmbedUrl(`https://www.pinterest.com/pin/${match[1]}`);
}

function rewriteYouTubeUrl(url: URL): string | null {
  if (url.protocol !== "https:" || !YOUTUBE_SOURCE_HOSTS.has(url.hostname.toLowerCase())) return null;

  const match = url.pathname.match(/^\/post\/(Ugk[A-Za-z0-9_-]{20,100})\/?$/);
  if (!match) return null;
  const [, postId] = match;
  return fixEmbedUrl(`https://www.youtube.com/post/${postId}`);
}

function rewriteBilibiliUrl(url: URL): string | null {
  const hostname = url.hostname.toLowerCase();
  if (url.protocol !== "https:" || !BILIBILI_SOURCE_HOSTS.has(hostname)) return null;

  if (hostname === "b23.tv") {
    const match = url.pathname.match(/^\/([A-Za-z0-9_-]{2,100})\/?$/);
    if (!match) return null;
    return fixEmbedUrl(`https://b23.tv/${match[1]}`);
  }

  const match = url.pathname.match(/^\/video\/(BV[A-Za-z0-9]{10}|av[0-9]{1,30})\/?$/);
  if (!match) return null;
  const [, videoId] = match;
  return fixEmbedUrl(`https://www.bilibili.com/video/${videoId}`);
}

function rewriteDeviantArtUrl(url: URL): string | null {
  const hostname = url.hostname.toLowerCase();
  if (url.protocol !== "https:" || !isDeviantArtHostname(hostname)) return null;

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
    return fixEmbedUrl(`https://www.deviantart.com/${artist}/art/${artworkSlug}`);
  }

  const legacyHostMatch = hostname.match(/^([A-Za-z0-9_-]{1,64})\.deviantart\.com$/);
  const legacyArtworkMatch = url.pathname.match(/^\/art\/([A-Za-z0-9_-]{1,200})\/?$/);
  if (!legacyHostMatch || !legacyArtworkMatch) return null;
  return fixEmbedUrl(`https://www.deviantart.com/${legacyHostMatch[1]}/art/${legacyArtworkMatch[1]}`);
}

function rewriteFacebookUrl(url: URL): string | null {
  const hostname = url.hostname.toLowerCase();
  if (url.protocol !== "https:" || !FACEBOOK_SOURCE_HOSTS.has(hostname)) return null;

  const canonicalPath = url.pathname.replace(/\/+$/, "") || "/";
  const firstSegment = canonicalPath.split("/")[1]?.toLowerCase() ?? "";
  const isUserPost = !FACEBOOK_RESERVED_ROUTE_NAMES.has(firstSegment)
    && /^\/[A-Za-z0-9._-]{1,100}\/posts\/[A-Za-z0-9._-]{2,200}$/.test(canonicalPath);
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
  if (url.protocol !== "https:" || !TIKTOK_SOURCE_HOSTS.has(url.hostname.toLowerCase())) return null;

  const match = url.pathname.match(
    /^\/@([A-Za-z0-9._]{1,24})\/(video|photo)\/([0-9]{1,30})\/?$/,
  );

  if (!match) return null;

  const [, username, contentType, postId] = match;
  return `https://tnktok.com/@${username}/${contentType}/${postId}`;
}

function rewriteRedditUrl(url: URL): string | null {
  if (url.protocol !== "https:" || !REDDIT_SOURCE_HOSTS.has(url.hostname.toLowerCase())) return null;

  const isPost = /^\/r\/[A-Za-z0-9_]{2,21}\/comments\/[A-Za-z0-9]+(?:\/[^/?#]+)?(?:\/[A-Za-z0-9]+)?\/?$/.test(url.pathname);
  const isShareLink = /^\/r\/[A-Za-z0-9_]{2,21}\/s\/[A-Za-z0-9]+\/?$/.test(url.pathname);

  if (!isPost && !isShareLink) return null;

  return `https://vxreddit.com${url.pathname}`;
}

function rewriteThreadsUrl(url: URL): string | null {
  if (url.protocol !== "https:" || !THREADS_SOURCE_HOSTS.has(url.hostname.toLowerCase())) return null;

  const match = url.pathname.match(
    /^\/@([A-Za-z0-9._]{1,30})\/post\/([A-Za-z0-9_-]+)\/?$/,
  );

  if (!match) return null;

  const [, username, shortcode] = match;
  return `https://vxthreads.com/@${username}/post/${shortcode}`;
}

export function rewriteUrlForPlatform(input: string, platform: Platform,): string | null {
  if (input !== input.trim()) return null;

  let url: URL;

  try {
    url = new URL(input);
  } catch {
    return null;
  }

  switch (platform) {
    case "x":
      return rewriteXUrl(url);
    case "instagram":
      return rewriteInstagramUrl(url);
    case "bluesky":
      return rewriteBlueskyUrl(url);
    case "tiktok":
      return rewriteTikTokUrl(url);
    case "twitch":
      return rewriteTwitchUrl(url);
    case "reddit":
      return rewriteRedditUrl(url);
    case "tumblr":
      return rewriteTumblrUrl(url);
    case "pixiv":
      return rewritePixivUrl(url);
    case "pinterest":
      return rewritePinterestUrl(url);
    case "youtube":
      return rewriteYouTubeUrl(url);
    case "bilibili":
      return rewriteBilibiliUrl(url);
    case "deviantart":
      return rewriteDeviantArtUrl(url);
    case "facebook":
      return rewriteFacebookUrl(url);
    case "threads":
      return rewriteThreadsUrl(url);
  }
}

export function rewriteSupportedUrl(input: string): RewrittenLink | null {
  let url: URL;

  try {
    url = new URL(input);
  } catch {
    return null;
  }

  const platform = platformForHostname(url.hostname);

  if (!platform) return null;

  const fixedUrl = rewriteUrlForPlatform(input, platform);
  return fixedUrl ? { fixedUrl, platform } : null;
}
