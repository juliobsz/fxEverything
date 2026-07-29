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
        <strong>✨ Get FxEverything for Chrome →</strong>
    </a>
</p>

Supported platforms:

- X posts: `x.com` → `fixupx.com`
- Instagram posts, Reels, and carousels: `instagram.com` → `oginstagram.com`
- Bluesky posts, replies, and quote posts: `bsky.app` → `fxbsky.app`
- TikTok videos and photo posts: `tiktok.com` → `tnktok.com`
- Reddit posts and share links: `reddit.com` → `vxreddit.com`
- Threads posts: `threads.com` or `threads.net` → `vxthreads.com`

Normal browsing is unchanged. Unsupported or uncertain links are copied
unchanged.

## Why?

Many chat apps and communities cannot create rich previews for social posts.
FxEverything fixes the link when you copy it, so the post is more likely to
embed cleanly wherever you share it, without changing how you browse.

## Install locally

1. Run `npm install`.
2. Run `npm run build`.
3. Open `chrome://extensions`.
4. Enable **Developer mode**.
5. Choose **Load unpacked** and select the generated `dist` folder.

## Development

```sh
npm run dev
npm run typecheck
npm run build
```

The release-ready archive is generated at
`release/fxeverything-x.x.x.zip`.

<details>
    <summary><b>Privacy and permissions</b></summary>

URL processing is local. The extension has no analytics, accounts, backend, or
extension-owned network requests. It stores only the six automatic-rewriting
preferences. See [`PRIVACY.md`](PRIVACY.md).

The extension requests:

- access only on the supported X, Instagram, Bluesky, TikTok, Reddit, and
  Threads hosts;
- `storage` for the six preferences;
- `activeTab` so the popup can copy a fixed link for the current page.

It does not request clipboard permissions or access to browsing history.
</details>

<details>
    <summary><b>Independence</b></summary>

FxEverything is not affiliated with X, Instagram, Bluesky, TikTok, Reddit,
Threads, FixupX, OGInstagram, FxBluesky, fxTikTok, vxreddit, vxThreads,
or Discord. The third-party embed services can change
or become unavailable.

</details>

<details>
    <summary><b>License</b></summary>
<a href="LICENSE">MIT</a>
</details>
