<div align="center">
    <img src="public/icon.png" alt="logo" style="height: 100px;"/>
    <h1 style="font-size: 28px;">FxEverything</h1>
</div>

<p align="center" width="100%">
<video src="https://github.com/user-attachments/assets/d63a5ece-1b17-4a4d-ba75-885b47135fd4" width="50%" controls></video>
</p>

<p align="center">
    FxEverything silently replaces supported social-media post URLs with links that
    produce richer embeds when you use the site's built-in <strong>Copy link</strong> action.
</p>

<p align="center">
    <a href="https://chromewebstore.google.com/detail/ogbkdfnmllglocipleheladghcjgjabk">
        <strong>Get FxEverything for Chrome</strong>
    </a>
</p>

Supported platforms:

- X posts: `x.com` or `twitter.com` -> `fixupx.com`
- Instagram posts, Reels, and carousels: `instagram.com` -> `oginstagram.com`
- Bluesky posts, replies, and quote posts: `bsky.app` -> `fxbsky.app`
- TikTok videos and photo posts: `tiktok.com` -> `tnktok.com`
- Twitch clips: `twitch.tv` and `clips.twitch.tv` -> `fixembed.app`
- Tumblr posts: `tumblr.com` blogs -> `fixembed.app`
- Pixiv artworks: `pixiv.net` -> `fixembed.app`
- Pinterest Pins and `pin.it` shares -> `fixembed.app`
- YouTube Community posts: `youtube.com/post/...` -> `fixembed.app`
- Bilibili videos and `b23.tv` shares -> `fixembed.app`
- DeviantArt artworks and `sta.sh` shares -> `fixembed.app`
- Facebook public user posts, Reels, `/share/p/` links, group posts, and story/permalink links -> `facebed.com`
- Reddit posts and share links: `reddit.com` -> `vxreddit.com`
- Threads posts: `threads.com` or `threads.net` -> `vxthreads.com`

Normal browsing is unchanged. Unsupported, malformed, private, profile, and unrelated links are copied unchanged.

## Why?

Many chat apps and communities cannot create rich previews for social posts. FxEverything fixes a supported link when you copy it, so it is more likely to embed cleanly wherever you share it, without changing how you browse.

## Install locally

1. Run `bun install`.
2. Run `bun run build`.
3. Open `chrome://extensions`.
4. Enable **Developer mode**.
5. Choose **Load unpacked** and select the generated `dist` folder.

## Development

```sh
bun run dev
bun run typecheck
bun run test
bun run build
```

The release-ready archive is generated at `release/fxeverything-x.x.x.zip`.

<details>
    <summary><b>Privacy and permissions</b></summary>

URL recognition and rewriting happen locally. The extension has no analytics, accounts, backend, or extension-owned network requests. It stores only the fourteen per-platform automatic-rewriting preferences. See [`PRIVACY.md`](PRIVACY.md).

The extension requests access only on supported platform hosts, `storage` for the fourteen preferences, and `activeTab` so the popup can copy a Fixed Link for the current page. It does not request clipboard permissions, browsing-history access, cookies, or all-sites access.
</details>

<details>
    <summary><b>Independence</b></summary>

FxEverything is not affiliated with any supported social platform, Discord, or the independent Embed Services FixupX, OGInstagram, FxBluesky, fxTikTok, FixEmbed, Facebed, vxreddit, or vxThreads. Third-party Embed Services can change or become unavailable.

</details>

<details>
    <summary><b>License</b></summary>
<a href="LICENSE">MIT</a>
</details>
