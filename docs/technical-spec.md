# Fx Everything - Technical Specification

## Runtime architecture

Fx Everything has four runtime entrypoints.

1. **MAIN-world clipboard interceptor** (`src/content/main.iife.ts`) - a CRXJS IIFE content script installed at `document_start` on supported hosts. It wraps `Clipboard.prototype.writeText` / `write` and listens for page-level `copy` events, substituting a Fixed Link only when the text is a lone supported Source Link and the platform is enabled. Uncertain and exceptional paths preserve original clipboard behavior.
2. **Isolated settings bridge** (`src/content/settings-bridge.iife.ts`) - a content script with `chrome.storage.local` access. It publishes validated preferences to the MAIN-world interceptor on load, when asked, and after storage changes.
3. **Service worker** (`src/background.ts`) - handles the `copy-fixed-link` command and context-menu items, writes the clipboard and shows confirmations via `chrome.scripting`, and re-injects the content scripts into already-open supported tabs on install/update.
4. **React popup** (`src/popup`) - manages preferences, previews and copies the current tab's Fixed Link, and shows the configured shortcut.

Shared modules: `src/shared/platforms.ts` (platform metadata, host matches, URL rewriting), `src/shared/settings.ts`, `src/shared/toast.ts`, and `src/shared/commands.ts`. `manifest.config.ts` derives host matches from `PLATFORMS`, so adding a platform is one metadata entry plus a rewriter.

## Why "works only after refresh" can't happen anymore

- **Open tabs on install/update.** Manifest content scripts only run on pages loaded afterwards. On `runtime.onInstalled` (install or update) the service worker injects every `content_scripts` entry from the built manifest into matching, non-discarded tabs.
- **Repeat injection is safe.** The interceptor stores one installation record on `window.__fxEverything__`. Prototype patches and listeners are installed once and delegate to the latest runtime object, so re-injection swaps in new rewrite logic without double-wrapping. The v1.x interceptor state (`__fxEverythingClipboardV3__`) is disabled when found.
- **No load-order race.** The interceptor starts with default settings (all enabled) and posts `fxeverything:settings-request:v5`; the bridge answers with `fxeverything:settings:v5`. Whichever script runs first, settings arrive. Before they arrive (a few milliseconds after page start) a user-disabled platform could theoretically be rewritten; this tradeoff was chosen over leaving a tab silently inactive.

## URL module

`src/shared/platforms.ts` is the public URL-recognition and rewrite seam. It accepts a complete HTTPS URL, ignoring only surrounding whitespace, and returns `null` for prose, malformed, unsupported, or uncertain routes.

- X -> FixupX: canonical public status paths on `x.com`, `twitter.com`, and their `www`/`mobile` hosts, including `/i/status/` and `/i/web/status/` shares.
- Instagram -> OGInstagram: post/Reel/TV paths (optionally profile-scoped), preserving only a valid `img_index`.
- Bluesky -> FxBluesky: handle- or DID-based post paths.
- TikTok -> fxTikTok (`tnktok.com`): video and photo-post paths.
- Reddit -> vxreddit: subreddit/user post and comment paths, `/comments/{id}`, and `/s/` share paths.
- Threads -> vxThreads: canonical post paths on current and legacy hosts.
- Facebook -> Facebed: allowlisted public user posts, Reels, `/share/p/` links, group posts, and story/permalink routes; query routes preserve only `story_fbid` and an optional validated `id`.
- Pixiv -> Phixiv: localized/non-localized artwork paths and legacy `member_illust.php` URLs.
- Tumblr -> fxtumblr (`www.tpmblr.com`): modern, `/blog/view/`, and legacy subdomain post permalinks.
- DeviantArt -> fixDeviantArt: modern/legacy artwork paths; `sta.sh` shares -> FixEmbed.
- Bilibili -> vxBilibili: BV/av video paths with optional `p`; `b23.tv` shares -> FixEmbed.
- Twitch -> FixEmbed: clip routes from channel or clips hosts, canonicalized to `clips.twitch.tv`.
- Pinterest -> FixEmbed: numeric (optionally slugged) Pin paths and validated `pin.it` shares.
- YouTube -> FixEmbed: Community `/post/{Ug...}` and `/@channel/community?lb=` paths only.

All rewrites discard tracking parameters and fragments. FixEmbed outputs contain the canonical Source Link in the endpoint's `url` parameter.

## Translations

Chrome's built-in i18n: `public/_locales/en` (default) and `pt_BR`. The manifest uses `__MSG_*__` keys; the popup and service worker call `t()` from `src/shared/i18n.ts`, whose key type comes from the English catalog. The MAIN-world script has no `chrome.i18n`, so the bridge sends its two notice strings with each settings message, validated and length-capped on arrival. `tests/i18n.test.ts` checks key and placeholder parity and the Web Store length limits.

## Settings

Booleans in `chrome.storage.local`, all defaulting to `true`:

- `enabled` - master switch for automatic rewriting;
- `showToast` - confirmation notice after automatic rewrites;
- `autoFixX`, `autoFixInstagram`, `autoFixBluesky`, `autoFixTikTok`, `autoFixTwitch`, `autoFixTumblr`, `autoFixPixiv`, `autoFixPinterest`, `autoFixYouTube`, `autoFixBilibili`, `autoFixDeviantArt`, `autoFixFacebook`, `autoFixReddit`, and `autoFixThreads` (names unchanged from v1 so saved preferences carry over).

`SETTINGS_KEYS`, `settingsFromStorage`, `settingKeyForPlatform`, and `isAutoFixEnabled` keep storage, popup state, bridge payloads, and the interceptor consistent.

## Message boundary

The isolated script sends a same-origin `window.postMessage` containing only the booleans. The MAIN-world listener checks the source window, page origin, message type, and payload shape, and hydrates through `settingsFromStorage`. The page can observe or spoof the message because MAIN-world code is not privileged; no sensitive data, URLs, extension IDs, or privileged operation crosses this boundary.

## Clipboard writes from the service worker

MV3 service workers have no clipboard. For the shortcut and context menu, the worker runs a small self-contained function in the active tab's isolated world via `chrome.scripting.executeScript` (`navigator.clipboard.writeText`, falling back to `execCommand("copy")`), then injects `showToast`. `showToast` must stay self-contained because it is serialized into the tab. If a page can't be scripted, the toolbar badge shows the result.

## Permissions and host access

- `storage` for local preferences.
- `activeTab` for user-invoked popup, shortcut, and context-menu actions.
- `scripting` for clipboard writes, confirmations, and re-injection into open tabs.
- `contextMenus` for the **Copy fixed link** items.
- `host_permissions` identical to the content-script matches (supported source hosts only), so updating adds no permission warning.
- No clipboard, browsing-history, cookie, tabs, network, or all-sites permission.

## Failure model

- Settings not yet loaded: defaults (enabled) apply until the bridge answers.
- URL recognition fails: original text is used.
- A rewrite throws, the toast fails, or clipboard wrapping cannot be installed: original platform behavior remains.
- The interceptor never cancels platform click events or changes navigation.
- Provider availability is not checked at runtime; changes require a release.

## Verification

- `bun run test:platforms` checks positive normalization variants, newer URL shapes, platform metadata consistency, and negative/fail-open cases, including protocol, prose, malformed input, already-fixed links, and hostname spoofing.
- `bun run test:regression` typechecks, builds the production extension, and executes the built MAIN-world bundle against a fake page: all fourteen platforms, startup before settings arrive, the settings handshake, disabled platform and master switch, foreign-origin messages, re-injection without double-wrapping, the legacy v1 state, copy events (selection and page-set data), `Clipboard.write`, and a failing toast. It also verifies the generated manifest (worlds, host matches equal to host permissions, permissions, service worker, command) and the popup bundle.
- `bun run test` runs both suites.
- The manual release checklist verifies live-site Copy Link mechanisms, current Embed Service previews, the shortcut and context menu, popup accessibility, and packaged-extension behavior.
