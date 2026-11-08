# Fx Everything - Product Specification

## Purpose

Fx Everything rewrites copied public social-media content URLs into Fixed Links that produce richer previews in messaging applications such as Discord. Normal browsing remains unchanged. The public product name is **Fx Everything**.

## Supported platforms

| Platform | Source hosts | Embed Service | Supported content |
| --- | --- | --- | --- |
| X | `x.com`, `www.x.com`, `twitter.com`, and mobile hosts | FixupX | Public posts, including `/i/status/` and `/i/web/status/` shares |
| Instagram | `instagram.com`, `www.instagram.com` | OGInstagram | Posts, Reels, IGTV, and carousels, including profile-scoped `/{user}/p/...` links |
| Bluesky | `bsky.app` | FxBluesky | Posts, replies, and quote posts |
| TikTok | `tiktok.com`, `www.tiktok.com`, `m.tiktok.com` | fxTikTok | Videos and photo posts |
| Reddit | `reddit.com`, `www.reddit.com` | vxreddit | Subreddit and user posts, comment permalinks, `/comments/{id}`, and `/s/` shares |
| Threads | `threads.com`, `www.threads.com`, and legacy `threads.net` equivalents | vxThreads | Public posts |
| Facebook | `facebook.com`, `www.facebook.com`, `m.facebook.com`, `mbasic.facebook.com` | Facebed | Public user posts, Reels, `/share/p/` links, group posts, and story/permalink routes |
| Pixiv | `pixiv.net`, `www.pixiv.net` | Phixiv | Artworks, including legacy artwork URLs |
| Tumblr | all `tumblr.com` subdomains | fxtumblr | Modern, legacy, and `/blog/view/` post permalinks |
| DeviantArt | all `deviantart.com` subdomains, `sta.sh` | fixDeviantArt; FixEmbed for `sta.sh` | Artwork permalinks and sta.sh shares |
| Bilibili | `bilibili.com`, `www.bilibili.com`, `m.bilibili.com`, `b23.tv` | vxBilibili; FixEmbed for `b23.tv` | BV/av videos and short share links |
| Twitch | `twitch.tv`, `www.twitch.tv`, `m.twitch.tv`, `clips.twitch.tv` | FixEmbed | Clips |
| Pinterest | all `pinterest.com` subdomains, `pin.it` | FixEmbed | Pins (including slugged Pin URLs) and short share links |
| YouTube | `youtube.com`, `www.youtube.com`, `m.youtube.com` | FixEmbed | Community posts under `/post/` or `/@channel/community?lb=` |

Profiles, feeds, boards, galleries, channels, watch pages, Marketplace, Stories not represented by a supported public permalink, live content, private content, malformed URLs, and unrelated routes are outside the supported set.

Embed Services were last verified with real posts and a Discord user agent on 2026-11-07. Dedicated services that return a direct `og:image` were preferred over FixEmbed where available.

## Ways to get a Fixed Link

1. **Automatic** - Fx Everything reacts to the clipboard operation produced by a supported platform's built-in **Copy Link** action (Clipboard API writes and copy events). It rewrites only a lone supported Source Link; surrounding whitespace is ignored, while prose and unrelated URLs remain unchanged.
2. **Keyboard shortcut** - `Alt+Shift+C` (user-configurable at `chrome://extensions/shortcuts`) copies the Fixed Link for the current tab. This is the equivalent of copying from the address bar, which Chrome does not let extensions intercept.
3. **Context menu** - **Copy fixed link** on any supported post link, on any website; **Copy fixed link to this post** anywhere on an open supported post.
4. **Popup** - previews the Fixed Link for the current tab, with Copy and Open buttons.

Explicit actions (2-4) work even when automatic rewriting is off for that platform.

For a supported action Fx Everything validates the URL, normalizes the public-content identifier, removes tracking information, constructs the Fixed Link, and writes it during the same user interaction.

If the URL cannot be recognized confidently, Fx Everything fails open and preserves the platform's original clipboard value. It never guesses or blocks copying.

## Confirmation

After a Fixed Link is copied, a small notice appears in the top-right corner of the page ("Fixed link copied - Platform → service"). For automatic rewrites it includes **Undo**, which restores the platform's original link. Automatic-rewrite notices can be turned off in the popup. Explicit actions always confirm, and also explain when the current page or link isn't a supported post. On pages Chrome doesn't allow scripting, the toolbar badge shows the result instead.

## URL normalization

- X, Instagram, Bluesky, TikTok, Reddit, and Threads preserve only their documented public-content paths and switch to their dedicated Embed Service hosts. Instagram alone may preserve a positive integer `img_index`.
- Pixiv routes normalize to `https://phixiv.net/artworks/{artworkId}`.
- Tumblr modern and legacy permalinks normalize to `https://www.tpmblr.com/{blog}/{postId}`.
- DeviantArt modern and legacy artwork routes normalize to `https://fixdeviantart.com/{artist}/art/{artwork}`.
- Bilibili BV/av routes normalize to `https://vxbilibili.com/video/{videoId}`, preserving a valid `p` (part) parameter.
- Twitch clip routes normalize to `https://clips.twitch.tv/{slug}`; Pinterest Pins to `https://www.pinterest.com/pin/{pinId}`; YouTube Community posts to `https://www.youtube.com/post/{postId}`; `pin.it`, `b23.tv`, and `sta.sh` links keep their validated short token. These are encoded in FixEmbed's `https://fixembed.app/embed?url=...` endpoint.
- Facebook allowlists the Facebed-documented user-post, Reel, `/share/p/`, group-post, story, and permalink routes; changes the host to `facebed.com`; removes tracking parameters; and preserves only required `story_fbid` and optional `id` query identifiers.
- Every output uses HTTPS and discards fragments.

## Popup

The React popup fits within Chrome's popup height without scrolling and contains:

- a master switch that pauses all automatic rewriting;
- a current-tab card showing the Fixed Link with **Copy fixed link** and **Open** actions, or guidance when the tab isn't a supported post;
- a compact grid of fourteen enabled-by-default platform toggles, with a "turn all on/off" action;
- the current copy shortcut with a link to change it;
- the confirmation-notice switch;
- version and a link to GitHub Issues.

The popup follows the operating system's light or dark preference and is keyboard-usable.

## Permissions and privacy

Fx Everything requests:

- host access only for the source hosts in the table (identical to the content-script matches, so no new install warning);
- `storage` for local boolean preferences;
- `activeTab` for user-invoked popup, shortcut, and context-menu actions;
- `scripting` to write the clipboard and show confirmations in the active tab, and to start the extension in already-open supported tabs after install or update;
- `contextMenus` for the **Copy fixed link** menu items.

It requests no clipboard, all-sites, history, cookie, tabs, or network permission.

URL processing is local. Fx Everything has no accounts, analytics, telemetry, remote configuration, extension-owned backend, or extension-owned network requests. Fixed Links are handled later by independent Embed Services under their own terms. The public policy is maintained in [`PRIVACY.md`](../PRIVACY.md).

## Technology and distribution

- Chrome Manifest V3, React, TypeScript, Vite, CRXJS, Tailwind CSS, and Bun with a committed lockfile
- React and Tailwind only in the popup; lightweight TypeScript for interception, URL rewriting, and the service worker
- Public Chrome Web Store target, public GitHub source, MIT license, free, no monetization
- Support through public GitHub Issues; no welcome page or onboarding tab

Fx Everything is not affiliated with any supported platform, Discord, or an independent Embed Service. Branding remains platform-neutral.

## Verification

`bun run test` runs focused URL tests, a production build, built clipboard-interceptor regressions for all fourteen platforms (including startup, re-injection, copy-event, and `Clipboard.write` paths), preference checks, and generated-manifest assertions. Every release must also complete [`manual-release-checklist.md`](./manual-release-checklist.md) against current live sites and messaging-app embeds.

## Known risks

- A social platform can change its URL or Copy Link implementation.
- An Embed Service can change behavior or become unavailable.
- Public or embed-eligible content can still fail because of platform or messaging-application restrictions.
- There are no provider health checks or remote configuration, so provider changes require a release.
