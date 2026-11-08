import { expect, test } from "bun:test";

const bundle = await Bun.file("dist/src/content/main.iife.js").text();

const SETTINGS_MESSAGE = "fxeverything:settings:v5";
const REQUEST_MESSAGE = "fxeverything:settings-request:v5";

const allOn = {
  enabled: true,
  showToast: false,
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

type Listener = (event: unknown) => void;

/** A fake page: one window, one Clipboard prototype, shared across injections. */
function createPage(hostname: string) {
  const listeners = new Map<string, Listener[]>();
  const posted: unknown[] = [];
  const writes: string[] = [];
  const itemWrites: unknown[][] = [];

  class Clipboard {
    writeText(value: string) {
      writes.push(value);
      return Promise.resolve();
    }
    write(items: unknown[]) {
      itemWrites.push(items);
      return Promise.resolve();
    }
  }

  class ClipboardItem {
    types: string[];
    constructor(public data: Record<string, Promise<Blob> | Blob>) {
      this.types = Object.keys(data);
    }
    getType(type: string) {
      return Promise.resolve(this.data[type]);
    }
  }

  const selection = { text: "" };
  const pageWindow: Record<string, unknown> = {
    addEventListener(type: string, listener: Listener) {
      listeners.set(type, [...(listeners.get(type) ?? []), listener]);
    },
    getSelection: () => ({ toString: () => selection.text }),
    postMessage(data: unknown) {
      posted.push(data);
    },
  };
  const navigator = { clipboard: new Clipboard() };

  const sandbox = {
    Blob,
    Clipboard,
    ClipboardItem,
    HTMLInputElement: class HTMLInputElement {},
    HTMLTextAreaElement: class HTMLTextAreaElement {},
    Promise,
    Reflect,
    URL,
    console,
    document: { activeElement: null, documentElement: null },
    location: { hostname, origin: `https://${hostname}` },
    navigator,
    window: pageWindow,
  };

  const inject = () => {
    const names = Object.keys(sandbox);
    const body = ['"use strict";', `const globalThis = { ${names.join(", ")} };`, bundle].join("\n");
    new Function(...names, body)(...Object.values(sandbox));
  };

  const dispatch = (type: string, event: unknown) => {
    for (const listener of listeners.get(type) ?? []) listener(event);
  };

  const sendSettings = (settings: Record<string, boolean>) => dispatch("message", {
    data: { type: SETTINGS_MESSAGE, settings },
    origin: `https://${hostname}`,
    source: pageWindow,
  });

  const copyEvent = (text: string, preset?: string) => {
    selection.text = text;
    const data = new Map<string, string>(preset ? [["text/plain", preset]] : []);
    let prevented = false;
    dispatch("copy", {
      clipboardData: {
        getData: (type: string) => data.get(type) ?? "",
        setData: (type: string, value: string) => data.set(type, value),
      },
      preventDefault: () => {
        prevented = true;
      },
    });
    return { text: data.get("text/plain") ?? null, prevented };
  };

  return {
    ClipboardItem,
    copyEvent,
    inject,
    itemWrites,
    listeners,
    navigator,
    pageWindow,
    posted,
    sendSettings,
    writes,
  };
}

const rewriteCases = [
  ["x.com", "https://x.com/example/status/123456789?s=20&t=abc", "https://fixupx.com/example/status/123456789"],
  ["twitter.com", "https://twitter.com/example/status/123456789", "https://fixupx.com/example/status/123456789"],
  ["www.x.com", "https://www.x.com/i/web/status/123456789?s=20", "https://fixupx.com/i/status/123456789"],
  ["www.instagram.com", "https://www.instagram.com/p/ABC_123/?igsh=tracking", "https://oginstagram.com/p/ABC_123/"],
  ["www.tiktok.com", "https://www.tiktok.com/@creator/video/7481234567890123456?tracking=1", "https://tnktok.com/@creator/video/7481234567890123456"],
  ["clips.twitch.tv", "https://clips.twitch.tv/DistinctiveClipSlug?tt_content=url", "https://fixembed.app/embed?url=https%3A%2F%2Fclips.twitch.tv%2FDistinctiveClipSlug"],
  ["www.threads.com", "https://www.threads.com/@creator/post/ABC_123?xmt=tracking", "https://vxthreads.com/@creator/post/ABC_123"],
  ["www.tumblr.com", "https://www.tumblr.com/example-blog/123456789012345678/a-post-slug?source=share", "https://www.tpmblr.com/example-blog/123456789012345678"],
  ["www.pixiv.net", "https://www.pixiv.net/en/artworks/123456789?utm_source=share#viewer", "https://phixiv.net/artworks/123456789"],
  ["www.pinterest.com", "https://www.pinterest.com/pin/123456789012345678/?utm_source=share", "https://fixembed.app/embed?url=https%3A%2F%2Fwww.pinterest.com%2Fpin%2F123456789012345678"],
  ["www.youtube.com", "https://www.youtube.com/post/UgkxiCSRfD6g7SPlWGPDa3vbP7aIsytXRkvy?si=tracking", "https://fixembed.app/embed?url=https%3A%2F%2Fwww.youtube.com%2Fpost%2FUgkxiCSRfD6g7SPlWGPDa3vbP7aIsytXRkvy"],
  ["www.bilibili.com", "https://www.bilibili.com/video/BV1xx411c7mD/?spm_id_from=333.337", "https://vxbilibili.com/video/BV1xx411c7mD"],
  ["www.deviantart.com", "https://www.deviantart.com/artist/art/example-artwork-123456789?utm_source=share", "https://fixdeviantart.com/artist/art/example-artwork-123456789"],
  ["www.facebook.com", "https://www.facebook.com/example.user/posts/pfbid02AbCdEf123?mibextid=abc", "https://facebed.com/example.user/posts/pfbid02AbCdEf123"],
  ["bsky.app", "https://bsky.app/profile/example.com/post/3kexample?ref=share", "https://fxbsky.app/profile/example.com/post/3kexample"],
  ["www.reddit.com", "https://www.reddit.com/r/example/comments/abc123/example_post/?share_id=tracking", "https://vxreddit.com/r/example/comments/abc123/example_post/"],
] as const;

for (const [hostname, sourceUrl, expectedUrl] of rewriteCases) {
  test(`writeText rewrites ${sourceUrl}`, async () => {
    const page = createPage(hostname);
    page.inject();
    page.sendSettings(allOn);
    await page.navigator.clipboard.writeText(sourceUrl);
    expect(page.writes).toEqual([expectedUrl]);
  });
}

test("works immediately, before the settings bridge has answered (no refresh needed)", async () => {
  const page = createPage("x.com");
  page.inject();
  await page.navigator.clipboard.writeText("https://x.com/example/status/1");
  expect(page.writes).toEqual(["https://fixupx.com/example/status/1"]);
});

test("asks the bridge for settings on start, so script load order doesn't matter", () => {
  const page = createPage("x.com");
  page.inject();
  expect(page.posted).toContainEqual({ type: REQUEST_MESSAGE });
});

test("respects a disabled platform", async () => {
  const page = createPage("www.facebook.com");
  page.inject();
  page.sendSettings({ ...allOn, autoFixFacebook: false });
  const url = "https://www.facebook.com/example.user/posts/pfbid02AbCdEf123?mibextid=abc";
  await page.navigator.clipboard.writeText(url);
  expect(page.writes).toEqual([url]);
});

test("respects the master switch", async () => {
  const page = createPage("x.com");
  page.inject();
  page.sendSettings({ ...allOn, enabled: false });
  await page.navigator.clipboard.writeText("https://x.com/example/status/1");
  expect(page.writes).toEqual(["https://x.com/example/status/1"]);
});

test("ignores settings messages from other sources", async () => {
  const page = createPage("x.com");
  page.inject();
  for (const listener of page.listeners.get("message") ?? []) {
    listener({ data: { type: SETTINGS_MESSAGE, settings: { ...allOn, enabled: false } }, origin: "https://evil.example", source: page.pageWindow });
  }
  await page.navigator.clipboard.writeText("https://x.com/example/status/1");
  expect(page.writes).toEqual(["https://fixupx.com/example/status/1"]);
});

test("leaves non-post text untouched", async () => {
  const page = createPage("x.com");
  page.inject();
  for (const text of ["https://x.com/home", "hello", "check https://x.com/a/status/1"]) {
    await page.navigator.clipboard.writeText(text);
  }
  expect(page.writes).toEqual(["https://x.com/home", "hello", "check https://x.com/a/status/1"]);
});

test("re-injection (after extension update) doesn't double-wrap and keeps settings", async () => {
  const page = createPage("x.com");
  page.inject();
  page.sendSettings({ ...allOn, autoFixX: false });
  page.inject();

  await page.navigator.clipboard.writeText("https://x.com/example/status/1");
  expect(page.writes).toEqual(["https://x.com/example/status/1"]);
  expect(page.listeners.get("copy")).toHaveLength(1);
  expect(page.listeners.get("message")).toHaveLength(1);

  page.sendSettings(allOn);
  await page.navigator.clipboard.writeText("https://x.com/example/status/1");
  expect(page.writes.at(-1)).toBe("https://fixupx.com/example/status/1");
});

test("uses the translated notice strings the bridge sends", () => {
  const page = createPage("x.com");
  page.inject();
  for (const listener of page.listeners.get("message") ?? []) {
    listener({
      data: { type: SETTINGS_MESSAGE, settings: allOn, strings: { copied: "Link corrigido copiado", undo: "Desfazer", extra: "ignored" } },
      origin: "https://x.com",
      source: page.pageWindow,
    });
  }
  const runtime = (page.pageWindow.__fxEverything__ as { runtime: { strings: Record<string, string> } }).runtime;
  expect(runtime.strings).toEqual({ copied: "Link corrigido copiado", undo: "Desfazer" });
});

test("turns off the v1.x interceptor left behind in already-open tabs", () => {
  const page = createPage("x.com");
  const legacy = { enabled: true };
  page.pageWindow.__fxEverythingClipboardV3__ = legacy;
  page.inject();
  expect(legacy.enabled).toBe(false);
});

test("copy events: rewrites a selected post link", () => {
  const page = createPage("www.reddit.com");
  page.inject();
  const result = page.copyEvent("https://www.reddit.com/r/example/comments/abc123/t/\n");
  expect(result).toEqual({ text: "https://vxreddit.com/r/example/comments/abc123/t/", prevented: true });
});

test("copy events: rewrites data a page's own copy handler already set", () => {
  const page = createPage("x.com");
  page.inject();
  const result = page.copyEvent("", "https://x.com/example/status/9?s=20");
  expect(result).toEqual({ text: "https://fixupx.com/example/status/9", prevented: true });
});

test("copy events: ordinary text copies are left alone", () => {
  const page = createPage("x.com");
  page.inject();
  expect(page.copyEvent("just some words")).toEqual({ text: null, prevented: false });
});

test("Clipboard.write: rewrites the text/plain item", async () => {
  const page = createPage("bsky.app");
  page.inject();
  const item = new page.ClipboardItem({
    "text/plain": new Blob(["https://bsky.app/profile/example.com/post/3kexample"], { type: "text/plain" }),
  });
  await (page.navigator.clipboard as unknown as { write(items: unknown[]): Promise<void> }).write([item]);

  const [written] = page.itemWrites[0] as InstanceType<typeof page.ClipboardItem>[];
  const blob = await written.getType("text/plain");
  expect(await blob.text()).toBe("https://fxbsky.app/profile/example.com/post/3kexample");
});

test("a failing toast never breaks the copy", async () => {
  const page = createPage("x.com");
  page.inject();
  page.sendSettings({ ...allOn, showToast: true });
  await page.navigator.clipboard.writeText("https://x.com/example/status/1");
  await Promise.resolve();
  expect(page.writes).toEqual(["https://fixupx.com/example/status/1"]);
});

test("generated manifest: permissions, worker, shortcut and matching worlds", async () => {
  const manifest = await Bun.file("dist/manifest.json").json() as {
    action: { default_popup: string };
    background: { service_worker: string };
    commands: Record<string, { suggested_key: { default: string } }>;
    content_scripts: Array<{ matches: string[]; world: string }>;
    host_permissions: string[];
    permissions: string[];
  };

  expect([...manifest.permissions].sort()).toEqual(["activeTab", "contextMenus", "scripting", "storage"]);
  expect(manifest.background.service_worker).toBeTruthy();
  expect(manifest.commands["copy-fixed-link"].suggested_key.default).toBe("Alt+Shift+C");
  expect(manifest.action.default_popup).toBe("popup.html");
  expect(manifest.content_scripts).toHaveLength(2);
  expect(manifest.content_scripts[0].world).toBe("MAIN");
  expect(manifest.content_scripts[1].world).toBe("ISOLATED");
  expect(manifest.content_scripts[0].matches).toEqual(manifest.content_scripts[1].matches);
  // Host access never exceeds the sites the content scripts already run on,
  // so updating doesn't trigger a new permission warning.
  expect([...manifest.host_permissions].sort()).toEqual([...manifest.content_scripts[0].matches].sort());
  expect(manifest.content_scripts[0].matches).not.toContain("<all_urls>");
  expect(manifest.content_scripts[0].matches).toHaveLength(46);
});

test("content scripts are self-contained (no dynamic-import loader that YouTube and others can block)", async () => {
  const manifest = await Bun.file("dist/manifest.json").json() as {
    content_scripts: Array<{ js: string[] }>;
    web_accessible_resources?: unknown;
  };
  expect(manifest.web_accessible_resources).toBeUndefined();
  for (const script of manifest.content_scripts) {
    for (const file of script.js) {
      expect(file).toEndWith(".iife.js");
      expect(await Bun.file(`dist/${file}`).text()).not.toContain("import(");
    }
  }
});

test("popup bundle lists every platform", async () => {
  const popupHtml = await Bun.file("dist/popup.html").text();
  const popupScriptPath = popupHtml.match(/src="\/([^"]+\.js)"/)?.[1];
  expect(popupScriptPath).toBeTruthy();

  const chunks = await Promise.all(
    [...new Bun.Glob("dist/assets/*.js").scanSync()].map((file) => Bun.file(file).text()),
  );
  const all = chunks.join("\n");
  for (const name of ["X / Twitter", "Instagram", "Bluesky", "TikTok", "Twitch", "Tumblr", "Pixiv", "Pinterest", "YouTube", "Bilibili", "DeviantArt", "Facebook", "Reddit", "Threads"]) {
    expect(all).toContain(name);
  }
});
