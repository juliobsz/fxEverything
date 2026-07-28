export type Platform = "x" | "instagram";

export interface RewrittenLink {
  fixedUrl: string;
  platform: Platform;
}

const X_SOURCE_HOST = "x.com";
const INSTAGRAM_SOURCE_HOSTS = new Set([
  "instagram.com",
  "www.instagram.com",
]);

export function platformForHostname(hostname: string): Platform | null {
  const normalizedHostname = hostname.toLowerCase();

  if (normalizedHostname === X_SOURCE_HOST) return "x";

  if (INSTAGRAM_SOURCE_HOSTS.has(normalizedHostname)) return "instagram";

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

export function rewriteUrlForPlatform(input: string, platform: Platform,): string | null {
  if (input !== input.trim()) return null;

  let url: URL;

  try {
    url = new URL(input);
  } catch {
    return null;
  }

  return platform === "x" ? rewriteXUrl(url) : rewriteInstagramUrl(url);
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
