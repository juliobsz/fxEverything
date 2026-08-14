import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";

const bundle = readFileSync(
  resolve("dist/src/content/main.iife.js"),
  "utf8",
);

const currentSettings = {
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

const legacySettings = {
  autoFixBluesky: true,
  autoFixInstagram: true,
  autoFixReddit: true,
  autoFixThreads: true,
  autoFixTikTok: true,
  autoFixX: true,
};

async function exercise({
  expectedUrl,
  hostname,
  messageType,
  settings,
  sourceUrl,
}) {
  const listeners = new Map();
  let clipboardValue = null;

  class Clipboard {
    writeText(value) {
      clipboardValue = value;
      return Promise.resolve();
    }
  }

  const pageWindow = {
    addEventListener(type, listener) {
      listeners.set(type, [...(listeners.get(type) ?? []), listener]);
    },
    getSelection() {
      return null;
    },
  };

  const context = vm.createContext({
    Blob,
    Clipboard,
    ClipboardItem: class ClipboardItem {},
    HTMLInputElement: class HTMLInputElement {},
    HTMLTextAreaElement: class HTMLTextAreaElement {},
    Promise,
    Reflect,
    URL,
    console,
    document: { activeElement: null },
    location: { hostname, origin: `https://${hostname}` },
    navigator: { clipboard: new Clipboard() },
    window: pageWindow,
  });

  vm.runInContext(bundle, context);

  for (const listener of listeners.get("message") ?? []) {
    listener({
      data: { settings, type: messageType },
      origin: `https://${hostname}`,
      source: pageWindow,
    });
  }

  await context.navigator.clipboard.writeText(sourceUrl);
  assert.equal(clipboardValue, expectedUrl);
}

const cases = [
  {
    expectedUrl: "https://fixupx.com/example/status/123456789",
    hostname: "x.com",
    messageType: "fxeverything:settings:v4",
    settings: currentSettings,
    sourceUrl: "https://x.com/example/status/123456789?s=20&t=abc",
  },
  {
    expectedUrl: "https://fixupx.com/example/status/123456789",
    hostname: "twitter.com",
    messageType: "fxeverything:settings:v4",
    settings: currentSettings,
    sourceUrl: "https://twitter.com/example/status/123456789",
  },
  {
    expectedUrl: "https://fixupx.com/i/status/123456789",
    hostname: "www.x.com",
    messageType: "fxeverything:settings:v4",
    settings: currentSettings,
    sourceUrl: "https://www.x.com/i/web/status/123456789?s=20",
  },
  {
    expectedUrl: "https://fixupx.com/example/status/123456789",
    hostname: "x.com",
    messageType: "fxeverything:settings:v3",
    settings: legacySettings,
    sourceUrl: "https://x.com/example/status/123456789",
  },
  {
    expectedUrl: "https://oginstagram.com/p/ABC_123/",
    hostname: "www.instagram.com",
    messageType: "fxeverything:settings:v3",
    settings: legacySettings,
    sourceUrl: "https://www.instagram.com/p/ABC_123/?igsh=tracking",
  },
  {
    expectedUrl: "https://tnktok.com/@creator/video/7481234567890123456",
    hostname: "www.tiktok.com",
    messageType: "fxeverything:settings:v4",
    settings: currentSettings,
    sourceUrl:
      "https://www.tiktok.com/@creator/video/7481234567890123456?tracking=1",
  },
  {
    expectedUrl:
      "https://fixembed.app/embed?url=https%3A%2F%2Fclips.twitch.tv%2FDistinctiveClipSlug",
    hostname: "clips.twitch.tv",
    messageType: "fxeverything:settings:v4",
    settings: currentSettings,
    sourceUrl:
      "https://clips.twitch.tv/DistinctiveClipSlug?tt_content=url&tt_medium=clips_api",
  },
  {
    expectedUrl: "https://vxthreads.com/@creator/post/ABC_123",
    hostname: "www.threads.com",
    messageType: "fxeverything:settings:v4",
    settings: currentSettings,
    sourceUrl: "https://www.threads.com/@creator/post/ABC_123?xmt=tracking",
  },
  {
    expectedUrl:
      "https://fixembed.app/embed?url=https%3A%2F%2Fwww.tumblr.com%2Fexample-blog%2F123456789012345678",
    hostname: "www.tumblr.com",
    messageType: "fxeverything:settings:v4",
    settings: currentSettings,
    sourceUrl:
      "https://www.tumblr.com/example-blog/123456789012345678/a-post-slug?source=share",
  },
  {
    expectedUrl:
      "https://fixembed.app/embed?url=https%3A%2F%2Fwww.pixiv.net%2Fartworks%2F123456789",
    hostname: "www.pixiv.net",
    messageType: "fxeverything:settings:v4",
    settings: currentSettings,
    sourceUrl:
      "https://www.pixiv.net/en/artworks/123456789?utm_source=share#viewer",
  },
  {
    expectedUrl:
      "https://fixembed.app/embed?url=https%3A%2F%2Fwww.pinterest.com%2Fpin%2F123456789012345678",
    hostname: "www.pinterest.com",
    messageType: "fxeverything:settings:v4",
    settings: currentSettings,
    sourceUrl:
      "https://www.pinterest.com/pin/123456789012345678/?utm_source=share",
  },
  {
    expectedUrl:
      "https://fixembed.app/embed?url=https%3A%2F%2Fwww.youtube.com%2Fpost%2FUgkxiCSRfD6g7SPlWGPDa3vbP7aIsytXRkvy",
    hostname: "www.youtube.com",
    messageType: "fxeverything:settings:v4",
    settings: currentSettings,
    sourceUrl:
      "https://www.youtube.com/post/UgkxiCSRfD6g7SPlWGPDa3vbP7aIsytXRkvy?si=tracking",
  },
  {
    expectedUrl:
      "https://fixembed.app/embed?url=https%3A%2F%2Fwww.bilibili.com%2Fvideo%2FBV1xx411c7mD",
    hostname: "www.bilibili.com",
    messageType: "fxeverything:settings:v4",
    settings: currentSettings,
    sourceUrl:
      "https://www.bilibili.com/video/BV1xx411c7mD/?spm_id_from=333.337",
  },
  {
    expectedUrl:
      "https://fixembed.app/embed?url=https%3A%2F%2Fwww.deviantart.com%2Fartist%2Fart%2Fexample-artwork-123456789",
    hostname: "www.deviantart.com",
    messageType: "fxeverything:settings:v4",
    settings: currentSettings,
    sourceUrl:
      "https://www.deviantart.com/artist/art/example-artwork-123456789?utm_source=share",
  },

  {
    expectedUrl: "https://facebed.com/example.user/posts/pfbid02AbCdEf123",
    hostname: "www.facebook.com",
    messageType: "fxeverything:settings:v4",
    settings: currentSettings,
    sourceUrl:
      "https://www.facebook.com/example.user/posts/pfbid02AbCdEf123?mibextid=abc",
  },

  {
    expectedUrl: "https://fxbsky.app/profile/example.com/post/3kexample",
    hostname: "bsky.app",
    messageType: "fxeverything:settings:v4",
    settings: currentSettings,
    sourceUrl: "https://bsky.app/profile/example.com/post/3kexample?ref=share",
  },
  {
    expectedUrl: "https://vxreddit.com/r/example/comments/abc123/example_post/",
    hostname: "www.reddit.com",
    messageType: "fxeverything:settings:v4",
    settings: currentSettings,
    sourceUrl:
      "https://www.reddit.com/r/example/comments/abc123/example_post/?share_id=tracking",
  },
  {
    expectedUrl:
      "https://www.facebook.com/example.user/posts/pfbid02AbCdEf123?mibextid=abc",
    hostname: "www.facebook.com",
    messageType: "fxeverything:settings:v4",
    settings: { ...currentSettings, autoFixFacebook: false },
    sourceUrl:
      "https://www.facebook.com/example.user/posts/pfbid02AbCdEf123?mibextid=abc",
  },
  {
    expectedUrl: "https://clips.twitch.tv/DistinctiveClipSlug?tracking=1",
    hostname: "clips.twitch.tv",
    messageType: "fxeverything:settings:v3",
    settings: legacySettings,
    sourceUrl: "https://clips.twitch.tv/DistinctiveClipSlug?tracking=1",
  },
];

for (const testCase of cases) await exercise(testCase);

const manifest = JSON.parse(
  readFileSync(resolve("dist/manifest.json"), "utf8"),
);
const requiredNewPlatformMatches = [
  "https://x.com/*",
  "https://www.x.com/*",
  "https://twitter.com/*",
  "https://www.twitter.com/*",
  "https://mobile.twitter.com/*",
  "https://bilibili.com/*",
  "https://www.bilibili.com/*",
  "https://m.bilibili.com/*",
  "https://b23.tv/*",
  "https://deviantart.com/*",
  "https://www.deviantart.com/*",
  "https://*.deviantart.com/*",
  "https://sta.sh/*",
  "https://facebook.com/*",
  "https://www.facebook.com/*",
  "https://m.facebook.com/*",
  "https://mbasic.facebook.com/*",
  "https://pixiv.net/*",
  "https://www.pixiv.net/*",
  "https://pinterest.com/*",
  "https://www.pinterest.com/*",
  "https://*.pinterest.com/*",
  "https://pin.it/*",
  "https://youtube.com/*",
  "https://www.youtube.com/*",
  "https://m.youtube.com/*",
  "https://twitch.tv/*",
  "https://www.twitch.tv/*",
  "https://m.twitch.tv/*",
  "https://clips.twitch.tv/*",
  "https://tumblr.com/*",
  "https://www.tumblr.com/*",
  "https://*.tumblr.com/*",
];

assert.deepEqual([...manifest.permissions].sort(), ["activeTab", "storage"]);
assert.equal(manifest.action.default_popup, "popup.html");
assert.equal(manifest.content_scripts.length, 2);
assert.equal(manifest.content_scripts[0].world, "MAIN");
assert.equal(manifest.content_scripts[1].world, "ISOLATED");
assert.deepEqual(
  manifest.content_scripts[0].matches,
  manifest.content_scripts[1].matches,
);
for (const match of requiredNewPlatformMatches) {
  assert.ok(manifest.content_scripts[0].matches.includes(match), match);
}
assert.ok(!manifest.content_scripts[0].matches.includes("<all_urls>"));

const popupHtml = readFileSync(resolve("dist/popup.html"), "utf8");
const popupScriptPath = popupHtml.match(/src="\/([^\"]+\.js)"/)?.[1];
assert.ok(popupScriptPath, "generated popup script");
const popupBundle = readFileSync(resolve("dist", popupScriptPath), "utf8");
const platformLabels = [
  "X",
  "Instagram",
  "Bluesky",
  "TikTok",
  "Twitch",
  "Tumblr",
  "Pixiv",
  "Pinterest",
  "YouTube Community",
  "Bilibili",
  "DeviantArt",
  "Facebook",
  "Reddit",
  "Threads",
];
for (const platformLabel of platformLabels) {
  assert.ok(
    popupBundle.includes(`Fix ${platformLabel} links automatically`),
    platformLabel,
  );
}

console.log(`Verified ${cases.length} built clipboard regression cases.`);
