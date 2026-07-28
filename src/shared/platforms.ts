export type Platform =
  | "x"
  | "instagram"
  | "bluesky"
  | "tiktok"
  | "reddit"
  | "threads";

export interface RewrittenLink {
  fixedUrl: string;
  platform: Platform;
}

const X_SOURCE_HOST = "x.com";
const BLUESKY_SOURCE_HOST = "bsky.app";
const TIKTOK_SOURCE_HOSTS = new Set([
  "tiktok.com",
  "www.tiktok.com",
  "m.tiktok.com",
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

export function platformForHostname(hostname: string): Platform | null {
  const normalizedHostname = hostname.toLowerCase();

  if (normalizedHostname === X_SOURCE_HOST) return "x";

  if (normalizedHostname === BLUESKY_SOURCE_HOST) return "bluesky";

  if (INSTAGRAM_SOURCE_HOSTS.has(normalizedHostname)) return "instagram";

  if (TIKTOK_SOURCE_HOSTS.has(normalizedHostname)) return "tiktok";

  if (REDDIT_SOURCE_HOSTS.has(normalizedHostname)) return "reddit";

  if (THREADS_SOURCE_HOSTS.has(normalizedHostname)) return "threads";

  return null;
}

function rewriteXUrl(url: URL): string | null {
  if (url.protocol !== "https:" || url.hostname.toLowerCase() !== X_SOURCE_HOST) return null;

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
    case "reddit":
      return rewriteRedditUrl(url);
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
