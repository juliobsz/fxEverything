# Chrome Web Store Listing Draft

## Name

Fx Everything

## Summary

Better social embeds for copied links from 14 popular platforms, with local processing and per-platform controls.

## Detailed description

Fx Everything improves supported links copied with social platforms' built-in **Copy link** actions. It recognizes and normalizes the URL locally, removes tracking information, and substitutes a link from an independent service that produces richer previews in apps such as Discord.

Supported platforms:

- X posts → FixupX
- Instagram posts, Reels, and carousels → OGInstagram
- Bluesky posts, replies, and quote posts → FxBsky
- TikTok videos and photo posts → TNKTOK
- Reddit posts and share links → vxReddit
- Threads posts → vxThreads
- Facebook public posts, Reels, group posts, and permalinks → Facebed
- Pixiv artworks → Phixiv
- Tumblr posts → fxtumblr
- DeviantArt artworks → fixDeviantArt (`sta.sh` shares → FixEmbed)
- Bilibili videos → vxBilibili (`b23.tv` shares → FixEmbed)
- Twitch clips → FixEmbed
- Pinterest Pins and share links → FixEmbed
- YouTube Community posts → FixEmbed

The extension does not change browsing or navigation. After a link is fixed it can show a small confirmation with an Undo button (can be turned off). Unsupported, malformed, private, profile, and unrelated URLs are copied unchanged.

Other ways to copy a fixed link:
- Keyboard shortcut Alt+Shift+C for the post open in the current tab
- Right-click any supported post link → Copy fixed link
- The popup, which previews the fixed link for the current tab

The popup also has a master on/off switch and one automatic-rewriting switch for each of the fourteen platforms. Manual copying keeps working when automatic rewriting is off.

Fx Everything processes URLs locally. It has no analytics, accounts, telemetry, remote configuration, backend, or extension-owned network requests. It stores only local on/off preferences. When a Fixed Link is later opened or shared, the receiving browser or app may contact its independent Embed Service under that service's own terms and privacy practices.

Fx Everything is not affiliated with any supported social platform, Discord, FixupX, OGInstagram, FxBluesky, fxTikTok, vxreddit, vxThreads, Facebed, Phixiv, fxtumblr, fixDeviantArt, vxBilibili, or FixEmbed. Third-party Embed Services can change or become unavailable.

## Single purpose

Rewrite recognized public-content links during copying so they produce richer embeds when shared.

## Permission justifications

### Host access

Access is limited to supported source hosts for X, Instagram, Bluesky, TikTok, Twitch, Tumblr, Pixiv, Pinterest, YouTube, Bilibili, DeviantArt, Facebook, Reddit, and Threads. It is needed to observe those sites' built-in Copy link operation and replace only recognized public-content URLs.

### storage

Stores local on/off preferences: a master switch, a confirmation-notice switch, and one automatic-rewriting switch per supported platform.

### activeTab

Lets the popup, keyboard shortcut, and right-click menu read the current tab or clicked link URL when the user invokes them, so the manual copy actions can work. It does not grant persistent browsing access.

### scripting

Writes the Fixed Link to the clipboard and shows a short confirmation in the tab where the user pressed the shortcut or used the right-click menu. After installation or an update, it also starts the extension in already-open tabs on supported sites so they work without a reload.

### contextMenus

Adds a "Copy fixed link" item when right-clicking a supported post link or an open post.

## Privacy disclosure answers

- Personally identifiable information: not collected
- Health information: not collected
- Financial and payment information: not collected
- Authentication information: not collected
- Personal communications: not collected
- Location: not collected
- Web history: not collected
- User activity: not collected
- Website content: not collected
- Data sold or transferred: no
- Data used for purposes unrelated to the single purpose: no

## Assets still needed for publication

- Chrome Web Store screenshots captured from the packaged extension
- Promotional tile artwork if desired
- Public GitHub repository URL
- Publicly hosted privacy-policy URL
