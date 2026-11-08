import { expect, test } from "bun:test";

import {
  PLATFORMS,
  platformForHostname,
  rewriteSupportedUrl,
} from "../src/shared/platforms.ts";
import {
  DEFAULT_SETTINGS,
  SETTINGS_KEYS,
  settingKeyForPlatform,
  settingsFromStorage,
} from "../src/shared/settings.ts";

test("X status links from current X and Twitter hosts become tracking-free FixupX links", () => {
  expect(platformForHostname("x.com")).toBe("x");
  expect(platformForHostname("www.x.com")).toBe("x");
  expect(platformForHostname("twitter.com")).toBe("x");
  expect(platformForHostname("www.twitter.com")).toBe("x");
  expect(platformForHostname("mobile.twitter.com")).toBe("x");

  const expected = {
    fixedUrl: "https://fixupx.com/example/status/123456789",
    platform: "x",
  };

  expect(
    rewriteSupportedUrl("https://x.com/example/status/123456789?s=20&t=abc"),
  ).toEqual(expected);
  expect(
    rewriteSupportedUrl("https://www.x.com/example/status/123456789/photo/1"),
  ).toEqual(expected);
  expect(
    rewriteSupportedUrl("https://twitter.com/example/status/123456789?s=20"),
  ).toEqual(expected);
  expect(
    rewriteSupportedUrl("https://www.twitter.com/example/status/123456789"),
  ).toEqual(expected);
  expect(
    rewriteSupportedUrl("https://mobile.twitter.com/example/status/123456789/video/1"),
  ).toEqual(expected);
  expect(rewriteSupportedUrl("https://x.com/i/web/status/123456789?s=20")).toEqual({
    fixedUrl: "https://fixupx.com/i/status/123456789",
    platform: "x",
  });
  expect(rewriteSupportedUrl("https://twitter.com/i/status/123456789")).toEqual({
    fixedUrl: "https://fixupx.com/i/status/123456789",
    platform: "x",
  });
});

test("Instagram, Bluesky, TikTok, Reddit, and Threads keep rewriting after newer platforms were added", () => {
  expect(
    rewriteSupportedUrl("https://www.instagram.com/p/ABC_123/?igsh=tracking"),
  ).toEqual({
    fixedUrl: "https://oginstagram.com/p/ABC_123/",
    platform: "instagram",
  });
  expect(
    rewriteSupportedUrl("https://bsky.app/profile/example.com/post/3kexample?ref=share"),
  ).toEqual({
    fixedUrl: "https://fxbsky.app/profile/example.com/post/3kexample",
    platform: "bluesky",
  });
  expect(
    rewriteSupportedUrl(
      "https://www.tiktok.com/@creator/video/7481234567890123456?tracking=1",
    ),
  ).toEqual({
    fixedUrl: "https://tnktok.com/@creator/video/7481234567890123456",
    platform: "tiktok",
  });
  expect(
    rewriteSupportedUrl(
      "https://www.reddit.com/r/example/comments/abc123/example_post/?share_id=tracking",
    ),
  ).toEqual({
    fixedUrl: "https://vxreddit.com/r/example/comments/abc123/example_post/",
    platform: "reddit",
  });
  expect(
    rewriteSupportedUrl("https://www.threads.net/@creator/post/ABC_123?xmt=tracking"),
  ).toEqual({
    fixedUrl: "https://vxthreads.com/@creator/post/ABC_123",
    platform: "threads",
  });
});

test("Twitch clip links become tracking-free FixEmbed links", () => {
  expect(platformForHostname("clips.twitch.tv")).toBe("twitch");
  expect(
    rewriteSupportedUrl(
      "https://clips.twitch.tv/DistinctiveClipSlug?tt_content=url&tt_medium=clips_api",
    ),
  ).toEqual({
    fixedUrl:
      "https://fixembed.app/embed?url=https%3A%2F%2Fclips.twitch.tv%2FDistinctiveClipSlug",
    platform: "twitch",
  });
  expect(
    rewriteSupportedUrl(
      "https://www.twitch.tv/example_channel/clip/DistinctiveClipSlug?filter=clips&range=7d",
    ),
  ).toEqual({
    fixedUrl:
      "https://fixembed.app/embed?url=https%3A%2F%2Fclips.twitch.tv%2FDistinctiveClipSlug",
    platform: "twitch",
  });
});

test("Tumblr post permalinks become canonical tracking-free links", () => {
  expect(platformForHostname("example-blog.tumblr.com")).toBe("tumblr");
  const expected = {
    fixedUrl:
      "https://www.tpmblr.com/example-blog/123456789012345678",
    platform: "tumblr",
  };

  expect(
    rewriteSupportedUrl(
      "https://www.tumblr.com/example-blog/123456789012345678/a-post-slug?source=share",
    ),
  ).toEqual(expected);
  expect(
    rewriteSupportedUrl(
      "https://example-blog.tumblr.com/post/123456789012345678/a-post-slug#notes",
    ),
  ).toEqual(expected);
});

test("Pixiv artwork links become canonical tracking-free links", () => {
  expect(platformForHostname("www.pixiv.net")).toBe("pixiv");
  const expected = {
    fixedUrl:
      "https://phixiv.net/artworks/123456789",
    platform: "pixiv",
  };

  expect(
    rewriteSupportedUrl(
      "https://www.pixiv.net/en/artworks/123456789?utm_source=share#viewer",
    ),
  ).toEqual(expected);
  expect(
    rewriteSupportedUrl(
      "https://www.pixiv.net/member_illust.php?mode=medium&illust_id=123456789",
    ),
  ).toEqual(expected);
});

test("Pinterest Pin links become tracking-free FixEmbed links", () => {
  expect(platformForHostname("br.pinterest.com")).toBe("pinterest");
  expect(
    rewriteSupportedUrl(
      "https://www.pinterest.com/pin/123456789012345678/?utm_source=share#details",
    ),
  ).toEqual({
    fixedUrl:
      "https://fixembed.app/embed?url=https%3A%2F%2Fwww.pinterest.com%2Fpin%2F123456789012345678",
    platform: "pinterest",
  });
  expect(rewriteSupportedUrl("https://pin.it/AbC123x?utm_campaign=share")).toEqual({
    fixedUrl: "https://fixembed.app/embed?url=https%3A%2F%2Fpin.it%2FAbC123x",
    platform: "pinterest",
  });
});

test("YouTube Community post links become tracking-free FixEmbed links", () => {
  expect(platformForHostname("m.youtube.com")).toBe("youtube");
  expect(
    rewriteSupportedUrl(
      "https://m.youtube.com/post/UgkxiCSRfD6g7SPlWGPDa3vbP7aIsytXRkvy?si=tracking#comments",
    ),
  ).toEqual({
    fixedUrl:
      "https://fixembed.app/embed?url=https%3A%2F%2Fwww.youtube.com%2Fpost%2FUgkxiCSRfD6g7SPlWGPDa3vbP7aIsytXRkvy",
    platform: "youtube",
  });
});

test("Bilibili video links become tracking-free vxBilibili links", () => {
  expect(platformForHostname("m.bilibili.com")).toBe("bilibili");
  expect(
    rewriteSupportedUrl(
      "https://www.bilibili.com/video/BV1xx411c7mD/?spm_id_from=333.1007.0.0#reply",
    ),
  ).toEqual({
    fixedUrl:
      "https://vxbilibili.com/video/BV1xx411c7mD",
    platform: "bilibili",
  });
  expect(rewriteSupportedUrl("https://b23.tv/AbC123x?share_source=copy_web")).toEqual({
    fixedUrl: "https://fixembed.app/embed?url=https%3A%2F%2Fb23.tv%2FAbC123x",
    platform: "bilibili",
  });
});

test("DeviantArt artwork links become tracking-free fixDeviantArt links", () => {
  expect(platformForHostname("artist.deviantart.com")).toBe("deviantart");
  const expectedArtwork = {
    fixedUrl:
      "https://fixdeviantart.com/artist/art/example-artwork-123456789",
    platform: "deviantart",
  };

  expect(
    rewriteSupportedUrl(
      "https://www.deviantart.com/artist/art/example-artwork-123456789?utm_source=share#comments",
    ),
  ).toEqual(expectedArtwork);
  expect(
    rewriteSupportedUrl(
      "https://artist.deviantart.com/art/example-artwork-123456789?tracking=1",
    ),
  ).toEqual(expectedArtwork);
  expect(rewriteSupportedUrl("https://sta.sh/01abcDEF?share=1")).toEqual({
    fixedUrl: "https://fixembed.app/embed?url=https%3A%2F%2Fsta.sh%2F01abcDEF",
    platform: "deviantart",
  });
});

test("Facebook public content links become tracking-free Facebed links", () => {
  expect(platformForHostname("m.facebook.com")).toBe("facebook");
  expect(
    rewriteSupportedUrl(
      "https://www.facebook.com/example.user/posts/pfbid02AbCdEf123?mibextid=abc#comments",
    ),
  ).toEqual({
    fixedUrl: "https://facebed.com/example.user/posts/pfbid02AbCdEf123",
    platform: "facebook",
  });
  expect(
    rewriteSupportedUrl("https://m.facebook.com/reel/123456789012345?locale=en_US"),
  ).toEqual({
    fixedUrl: "https://facebed.com/reel/123456789012345",
    platform: "facebook",
  });
  expect(
    rewriteSupportedUrl("https://www.facebook.com/share/p/AbCdEf123/?mibextid=abc"),
  ).toEqual({
    fixedUrl: "https://facebed.com/share/p/AbCdEf123",
    platform: "facebook",
  });
});

test("unsupported and malformed new-platform URLs fail open", () => {
  const unsupportedUrls = [
    "https://www.twitch.tv/example_channel",
    "https://www.tumblr.com/example-blog",
    "https://www.pixiv.net/users/123456",
    "https://www.pinterest.com/example/board-name/",
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "https://www.bilibili.com/space/123456",
    "https://www.deviantart.com/artist/gallery",
    "https://www.facebook.com/example.user",
    "https://www.facebook.com/marketplace/posts/not-public-content",
    "https://www.facebook.com/watch/?v=123456789012345",
    "https://www.facebook.com/photo.php?fbid=123456789012345",
    "https://www.facebook.com/example.user/videos/123456789012345",
    "https://www.facebook.com/share/r/AbCdEf123",
    "https://www.facebook.com/groups/example.group/permalink/123456789",
    "http://clips.twitch.tv/DistinctiveClipSlug",
    "https://clips.twitch.tv/DistinctiveClipSlug and some prose",
  ];

  for (const url of unsupportedUrls) {
    expect(rewriteSupportedUrl(url), url).toBeNull();
  }

  expect(platformForHostname("youtube.com.evil.example")).toBeNull();
  expect(platformForHostname("notx.com")).toBeNull();
  expect(platformForHostname("nottwitter.com")).toBeNull();
  expect(platformForHostname("notfacebook.com")).toBeNull();
  expect(rewriteSupportedUrl("not a URL")).toBeNull();
});

test("Facebook supported permalink families preserve only required identifiers", () => {
  const cases = [
    [
      "https://www.facebook.com/permalink.php?story_fbid=123456789&id=987654321&ref=share",
      "https://facebed.com/permalink.php?story_fbid=123456789&id=987654321",
    ],
    [
      "https://www.facebook.com/story.php?story_fbid=123456789&id=987654321&ref=share",
      "https://facebed.com/story.php?story_fbid=123456789&id=987654321",
    ],
    [
      "https://www.facebook.com/groups/example.group/posts/123456789?mibextid=abc",
      "https://facebed.com/groups/example.group/posts/123456789",
    ],
  ] as const;

  for (const [sourceUrl, fixedUrl] of cases) {
    expect(rewriteSupportedUrl(sourceUrl)).toEqual({
      fixedUrl,
      platform: "facebook",
    });
  }
});

test("every platform maps to an independent persisted setting", () => {
  const mappings = [
    ["x", "autoFixX"],
    ["instagram", "autoFixInstagram"],
    ["bluesky", "autoFixBluesky"],
    ["tiktok", "autoFixTikTok"],
    ["twitch", "autoFixTwitch"],
    ["tumblr", "autoFixTumblr"],
    ["pixiv", "autoFixPixiv"],
    ["pinterest", "autoFixPinterest"],
    ["youtube", "autoFixYouTube"],
    ["bilibili", "autoFixBilibili"],
    ["deviantart", "autoFixDeviantArt"],
    ["facebook", "autoFixFacebook"],
    ["reddit", "autoFixReddit"],
    ["threads", "autoFixThreads"],
  ] as const;

  expect(SETTINGS_KEYS).toHaveLength(mappings.length + 2);
  expect(DEFAULT_SETTINGS.enabled).toBe(true);
  expect(DEFAULT_SETTINGS.showToast).toBe(true);
  for (const [platform, settingKey] of mappings) {
    expect(settingKeyForPlatform(platform)).toBe(settingKey);
    expect(DEFAULT_SETTINGS[settingKey]).toBe(true);
  }

  const hydrated = settingsFromStorage({
    autoFixFacebook: false,
    autoFixTwitch: "not a boolean",
  });
  expect(hydrated.autoFixFacebook).toBe(false);
  expect(hydrated.autoFixTwitch).toBe(true);
});

test("copied links with surrounding whitespace are still fixed", () => {
  expect(rewriteSupportedUrl("  https://x.com/example/status/123456789\n")).toEqual({
    fixedUrl: "https://fixupx.com/example/status/123456789",
    platform: "x",
  });
});

test("newer URL shapes are recognized", () => {
  const cases = [
    ["https://www.instagram.com/someone/p/ABC_123/", "https://oginstagram.com/p/ABC_123/"],
    ["https://www.instagram.com/someone/reel/ABC_123/?igsh=x", "https://oginstagram.com/reel/ABC_123/"],
    ["https://www.reddit.com/user/someone/comments/abc123/title/", "https://vxreddit.com/user/someone/comments/abc123/title/"],
    ["https://www.reddit.com/comments/abc123", "https://vxreddit.com/comments/abc123"],
    ["https://www.tumblr.com/blog/view/example-blog/123456789012345678", "https://www.tpmblr.com/example-blog/123456789012345678"],
    ["https://www.bilibili.com/video/BV1xx411c7mD/?p=3&spm_id_from=x", "https://vxbilibili.com/video/BV1xx411c7mD?p=3"],
    ["https://www.pinterest.com/pin/some-title--123456789012345678/", "https://fixembed.app/embed?url=https%3A%2F%2Fwww.pinterest.com%2Fpin%2F123456789012345678"],
    ["https://www.youtube.com/@channel/community?lb=UgkxiCSRfD6g7SPlWGPDa3vbP7aIsytXRkvy", "https://fixembed.app/embed?url=https%3A%2F%2Fwww.youtube.com%2Fpost%2FUgkxiCSRfD6g7SPlWGPDa3vbP7aIsytXRkvy"],
    ["https://www.threads.com/@creator/post/ABC_123/media", "https://vxthreads.com/@creator/post/ABC_123"],
  ] as const;

  for (const [sourceUrl, fixedUrl] of cases) {
    expect(rewriteSupportedUrl(sourceUrl)?.fixedUrl, sourceUrl).toBe(fixedUrl);
  }
});

test("already-fixed links are never rewritten again", () => {
  for (const url of [
    "https://fixupx.com/example/status/123456789",
    "https://oginstagram.com/p/ABC_123/",
    "https://phixiv.net/artworks/123456789",
  ]) {
    expect(rewriteSupportedUrl(url)).toBeNull();
  }
});

test("platform metadata covers every platform exactly once", () => {
  const ids = PLATFORMS.map((platform) => platform.id);
  expect(new Set(ids).size).toBe(ids.length);
  expect(ids).toHaveLength(14);
  for (const platform of PLATFORMS) {
    expect(platform.matches.length).toBeGreaterThan(0);
    for (const match of platform.matches) {
      const host = match.replace("https://", "").replace("/*", "").replace("*.", "sub.");
      expect(platformForHostname(host), match).toBe(platform.id);
    }
  }
});
