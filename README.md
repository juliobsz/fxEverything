<div align="center">
    <img src="public/icon.png" alt="logo" style="height: 100px;"/>
    <h1 style="font-size: 28px;">FxEverything</h1>
    <p>Better Social Embeds</p>
</div>
<p align="center">
    FxEverything silently replaces supported social-media post URLs with links that
    produce richer embeds when you use the site's built-in <strong>Copy link</strong> action.
</p>

#### The extension is pending review on the Chrome Web Store.

Version 1.0 supports:

- X posts: `x.com` → `fixupx.com`
- Instagram posts, Reels, and carousels: `instagram.com` → `oginstagram.com`

Normal browsing is unchanged. Unsupported or uncertain links are copied
unchanged.

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
extension-owned network requests. It stores only the two automatic-rewriting
preferences. See [`PRIVACY.md`](PRIVACY.md).

The extension requests:

- access only on `x.com`, `instagram.com`, and `www.instagram.com`;
- `storage` for the two preferences;
- `activeTab` so the popup can copy a fixed link for the current page.

It does not request clipboard permissions or access to browsing history.
</details>

<details>
    <summary><b>Independence</b></summary>

FxEverything is not affiliated with X, Instagram, FixupX, OGInstagram, or
Discord. The third-party embed services can change or become unavailable.

</details>

<details>
    <summary><b>License</b></summary>
<a href="LICENSE">MIT</a>
</details>
