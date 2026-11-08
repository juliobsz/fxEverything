# Privacy Policy

Effective date: November 7, 2026

Fx Everything rewrites supported social-media links locally in the browser so they produce richer previews when shared. It does not collect, transmit, sell, or retain personal information, browsing history, website content, clipboard contents, or usage analytics.

## Local processing

Fx Everything runs only on supported pages for X, Instagram, Bluesky, TikTok, Twitch, Tumblr, Pixiv, Pinterest, YouTube, Bilibili, DeviantArt, Facebook, Reddit, and Threads. Its website access is limited to these host families:

- `x.com`, `twitter.com`, `instagram.com`, `bsky.app`, and `tiktok.com`;
- `twitch.tv` and `clips.twitch.tv`;
- all `tumblr.com` subdomains;
- `pixiv.net`;
- all `pinterest.com` subdomains and `pin.it`;
- `youtube.com`;
- `bilibili.com` and `b23.tv`;
- all `deviantart.com` subdomains and `sta.sh`;
- `facebook.com` desktop and mobile hosts;
- `reddit.com`;
- `threads.com` and `threads.net`.

When a supported platform writes a recognized public-content URL during its built-in Copy link operation, the extension removes tracking information and substitutes a Fixed Link. The user can also explicitly copy a Fixed Link with the keyboard shortcut, the right-click **Copy fixed link** menu item, or the popup. Recognition and rewriting occur locally. The Source Link is not sent to Fx Everything or its maintainers, and the extension makes no network request to an Embed Service while rewriting.

The extension does not read existing clipboard contents. It can replace text that a supported page is already writing to the clipboard during the user's copy action, and it writes a Fixed Link to the clipboard when the user explicitly asks for one. The optional **Undo** button writes back the original link the page was copying.

## Stored settings

Fx Everything stores only on/off preferences (a master switch, a confirmation-notice switch, and one automatic-rewriting switch per supported platform) in Chrome's local extension storage. These settings remain on the user's device and can be removed by uninstalling the extension or clearing its stored data.

## Third-party Embed Services

Fixed Links point to independent third-party Embed Services: FixupX, OGInstagram, FxBluesky, fxTikTok, vxreddit, vxThreads, Facebed, Phixiv, fxtumblr, fixDeviantArt, vxBilibili, and FixEmbed. Fx Everything does not operate or control these services.

A FixEmbed Fixed Link contains the canonical Source Link as its `url` query parameter. This only constructs text locally; Fx Everything does not contact FixEmbed. When any Fixed Link is later shared or opened, the messaging application, browser, or other software handling it may contact the relevant Embed Service and provide the information contained in that link. That later interaction is governed by the third party's terms and privacy practices.

## Permissions

Fx Everything requests page access only on the supported hosts listed under **Local processing**. This access lets it substitute recognized URLs written by those sites.

The `storage` permission saves the local preferences described above. The `activeTab` permission lets the popup, keyboard shortcut, and right-click menu read the current page or clicked link URL only when the user invokes them. The `scripting` permission is used to write the Fixed Link to the clipboard and show the confirmation notice in that tab, and, after installation or an update, to start Fx Everything in already-open tabs on supported sites. The `contextMenus` permission adds the **Copy fixed link** menu item.

Fx Everything does not request clipboard, browsing-history, cookie, or all-sites permissions.

## Changes

Any future change to Fx Everything's data practices will be reflected in this policy and disclosed as required by the Chrome Web Store policies.

## Contact

Questions and privacy concerns may be submitted through the project's public GitHub Issues page. Do not include private links, personal information, or other sensitive data in a public issue.
