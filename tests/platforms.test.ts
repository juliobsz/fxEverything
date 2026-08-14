import assert from "node:assert/strict";
import test from "node:test";

import {
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
  assert.equal(platformForHostname("x.com"), "x");
  assert.equal(platformForHostname("www.x.com"), "x");
  assert.equal(platformForHostname("twitter.com"), "x");
  assert.equal(platformForHostname("www.twitter.com"), "x");
  assert.equal(platformForHostname("mobile.twitter.com"), "x");

  const expected = {
    fixedUrl: "https://fixupx.com/example/status/123456789",
    platform: "x",
  };

  assert.deepEqual(
    rewriteSupportedUrl("https://x.com/example/status/123456789?s=20&t=abc"),
    expected,
  );
  assert.deepEqual(
    rewriteSupportedUrl("https://www.x.com/example/status/123456789/photo/1"),
    expected,
  );
  assert.deepEqual(
    rewriteSupportedUrl("https://twitter.com/example/status/123456789?s=20"),
    expected,
  );
  assert.deepEqual(
    rewriteSupportedUrl("https://www.twitter.com/example/status/123456789"),
    expected,
  );
  assert.deepEqual(
    rewriteSupportedUrl("https://mobile.twitter.com/example/status/123456789/video/1"),
    expected,
  );
  assert.deepEqual(
    rewriteSupportedUrl("https://x.com/i/web/status/123456789?s=20"),
    {
      fixedUrl: "https://fixupx.com/i/status/123456789",
      platform: "x",
    },
  );
  assert.deepEqual(
    rewriteSupportedUrl("https://twitter.com/i/status/123456789"),
    {
      fixedUrl: "https://fixupx.com/i/status/123456789",
      platform: "x",
    },
  );
});

test("Instagram, Bluesky, TikTok, Reddit, and Threads keep rewriting after newer platforms were added", () => {
  assert.deepEqual(
    rewriteSupportedUrl("https://www.instagram.com/p/ABC_123/?igsh=tracking"),
    {
      fixedUrl: "https://oginstagram.com/p/ABC_123/",
      platform: "instagram",
    },
  );
  assert.deepEqual(
    rewriteSupportedUrl("https://bsky.app/profile/example.com/post/3kexample?ref=share"),
    {
      fixedUrl: "https://fxbsky.app/profile/example.com/post/3kexample",
      platform: "bluesky",
    },
  );
  assert.deepEqual(
    rewriteSupportedUrl(
      "https://www.tiktok.com/@creator/video/7481234567890123456?tracking=1",
    ),
    {
      fixedUrl: "https://tnktok.com/@creator/video/7481234567890123456",
      platform: "tiktok",
    },
  );
  assert.deepEqual(
    rewriteSupportedUrl(
      "https://www.reddit.com/r/example/comments/abc123/example_post/?share_id=tracking",
    ),
    {
      fixedUrl: "https://vxreddit.com/r/example/comments/abc123/example_post/",
      platform: "reddit",
    },
  );
  assert.deepEqual(
    rewriteSupportedUrl("https://www.threads.net/@creator/post/ABC_123?xmt=tracking"),
    {
      fixedUrl: "https://vxthreads.com/@creator/post/ABC_123",
      platform: "threads",
    },
  );
});

test("Twitch clip links become tracking-free FixEmbed links", () => {
  assert.equal(platformForHostname("clips.twitch.tv"), "twitch");
  assert.deepEqual(
    rewriteSupportedUrl(
      "https://clips.twitch.tv/DistinctiveClipSlug?tt_content=url&tt_medium=clips_api",
    ),
    {
      fixedUrl:
        "https://fixembed.app/embed?url=https%3A%2F%2Fclips.twitch.tv%2FDistinctiveClipSlug",
      platform: "twitch",
    },
  );
  assert.deepEqual(
    rewriteSupportedUrl(
      "https://www.twitch.tv/example_channel/clip/DistinctiveClipSlug?filter=clips&range=7d",
    ),
    {
      fixedUrl:
        "https://fixembed.app/embed?url=https%3A%2F%2Fclips.twitch.tv%2FDistinctiveClipSlug",
      platform: "twitch",
    },
  );
});

test("Tumblr post permalinks become canonical tracking-free FixEmbed links", () => {
  assert.equal(platformForHostname("example-blog.tumblr.com"), "tumblr");
  const expected = {
    fixedUrl:
      "https://fixembed.app/embed?url=https%3A%2F%2Fwww.tumblr.com%2Fexample-blog%2F123456789012345678",
    platform: "tumblr",
  };

  assert.deepEqual(
    rewriteSupportedUrl(
      "https://www.tumblr.com/example-blog/123456789012345678/a-post-slug?source=share",
    ),
    expected,
  );
  assert.deepEqual(
    rewriteSupportedUrl(
      "https://example-blog.tumblr.com/post/123456789012345678/a-post-slug#notes",
    ),
    expected,
  );
});

test("Pixiv artwork links become canonical tracking-free FixEmbed links", () => {
  assert.equal(platformForHostname("www.pixiv.net"), "pixiv");
  const expected = {
    fixedUrl:
      "https://fixembed.app/embed?url=https%3A%2F%2Fwww.pixiv.net%2Fartworks%2F123456789",
    platform: "pixiv",
  };

  assert.deepEqual(
    rewriteSupportedUrl(
      "https://www.pixiv.net/en/artworks/123456789?utm_source=share#viewer",
    ),
    expected,
  );
  assert.deepEqual(
    rewriteSupportedUrl(
      "https://www.pixiv.net/member_illust.php?mode=medium&illust_id=123456789",
    ),
    expected,
  );
});

test("Pinterest Pin links become tracking-free FixEmbed links", () => {
  assert.equal(platformForHostname("br.pinterest.com"), "pinterest");
  assert.deepEqual(
    rewriteSupportedUrl(
      "https://www.pinterest.com/pin/123456789012345678/?utm_source=share#details",
    ),
    {
      fixedUrl:
        "https://fixembed.app/embed?url=https%3A%2F%2Fwww.pinterest.com%2Fpin%2F123456789012345678",
      platform: "pinterest",
    },
  );
  assert.deepEqual(
    rewriteSupportedUrl("https://pin.it/AbC123x?utm_campaign=share"),
    {
      fixedUrl:
        "https://fixembed.app/embed?url=https%3A%2F%2Fpin.it%2FAbC123x",
      platform: "pinterest",
    },
  );
});

test("YouTube Community post links become tracking-free FixEmbed links", () => {
  assert.equal(platformForHostname("m.youtube.com"), "youtube");
  assert.deepEqual(
    rewriteSupportedUrl(
      "https://m.youtube.com/post/UgkxiCSRfD6g7SPlWGPDa3vbP7aIsytXRkvy?si=tracking#comments",
    ),
    {
      fixedUrl:
        "https://fixembed.app/embed?url=https%3A%2F%2Fwww.youtube.com%2Fpost%2FUgkxiCSRfD6g7SPlWGPDa3vbP7aIsytXRkvy",
      platform: "youtube",
    },
  );
});

test("Bilibili video links become tracking-free FixEmbed links", () => {
  assert.equal(platformForHostname("m.bilibili.com"), "bilibili");
  assert.deepEqual(
    rewriteSupportedUrl(
      "https://www.bilibili.com/video/BV1xx411c7mD/?spm_id_from=333.1007.0.0#reply",
    ),
    {
      fixedUrl:
        "https://fixembed.app/embed?url=https%3A%2F%2Fwww.bilibili.com%2Fvideo%2FBV1xx411c7mD",
      platform: "bilibili",
    },
  );
  assert.deepEqual(
    rewriteSupportedUrl("https://b23.tv/AbC123x?share_source=copy_web"),
    {
      fixedUrl: "https://fixembed.app/embed?url=https%3A%2F%2Fb23.tv%2FAbC123x",
      platform: "bilibili",
    },
  );
});

test("DeviantArt artwork links become tracking-free FixEmbed links", () => {
  assert.equal(platformForHostname("artist.deviantart.com"), "deviantart");
  const expectedArtwork = {
    fixedUrl:
      "https://fixembed.app/embed?url=https%3A%2F%2Fwww.deviantart.com%2Fartist%2Fart%2Fexample-artwork-123456789",
    platform: "deviantart",
  };

  assert.deepEqual(
    rewriteSupportedUrl(
      "https://www.deviantart.com/artist/art/example-artwork-123456789?utm_source=share#comments",
    ),
    expectedArtwork,
  );
  assert.deepEqual(
    rewriteSupportedUrl(
      "https://artist.deviantart.com/art/example-artwork-123456789?tracking=1",
    ),
    expectedArtwork,
  );
  assert.deepEqual(rewriteSupportedUrl("https://sta.sh/01abcDEF?share=1"), {
    fixedUrl:
      "https://fixembed.app/embed?url=https%3A%2F%2Fsta.sh%2F01abcDEF",
    platform: "deviantart",
  });
});

test("Facebook public content links become tracking-free Facebed links", () => {
  assert.equal(platformForHostname("m.facebook.com"), "facebook");
  assert.deepEqual(
    rewriteSupportedUrl(
      "https://www.facebook.com/example.user/posts/pfbid02AbCdEf123?mibextid=abc#comments",
    ),
    {
      fixedUrl: "https://facebed.com/example.user/posts/pfbid02AbCdEf123",
      platform: "facebook",
    },
  );
  assert.deepEqual(
    rewriteSupportedUrl("https://m.facebook.com/reel/123456789012345?locale=en_US"),
    {
      fixedUrl: "https://facebed.com/reel/123456789012345",
      platform: "facebook",
    },
  );
  assert.deepEqual(
    rewriteSupportedUrl("https://www.facebook.com/share/p/AbCdEf123/?mibextid=abc"),
    {
      fixedUrl: "https://facebed.com/share/p/AbCdEf123",
      platform: "facebook",
    },
  );
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
    " https://clips.twitch.tv/DistinctiveClipSlug",
  ];

  for (const url of unsupportedUrls) assert.equal(rewriteSupportedUrl(url), null, url);

  assert.equal(platformForHostname("youtube.com.evil.example"), null);
  assert.equal(platformForHostname("notx.com"), null);
  assert.equal(platformForHostname("nottwitter.com"), null);
  assert.equal(platformForHostname("notfacebook.com"), null);
  assert.equal(rewriteSupportedUrl("not a URL"), null);
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
    assert.deepEqual(rewriteSupportedUrl(sourceUrl), {
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

  assert.equal(SETTINGS_KEYS.length, mappings.length);
  for (const [platform, settingKey] of mappings) {
    assert.equal(settingKeyForPlatform(platform), settingKey);
    assert.equal(DEFAULT_SETTINGS[settingKey], true);
  }

  const hydrated = settingsFromStorage({
    autoFixFacebook: false,
    autoFixTwitch: "not a boolean",
  });
  assert.equal(hydrated.autoFixFacebook, false);
  assert.equal(hydrated.autoFixTwitch, true);
});
