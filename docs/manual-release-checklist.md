# Manual Release Checklist

Complete this checklist against the exact production build before each release.

## Automated preflight

- [ ] `bun run test` passes.
- [ ] `bun run typecheck` passes.
- [ ] `bun run build` produces the extension and release ZIP.
- [ ] `git diff --check` reports no whitespace errors.

## Installation and permissions

- [ ] The production build loads through Chrome's **Load unpacked** flow.
- [ ] Website access is limited to X, Instagram, Bluesky, TikTok, Twitch, Tumblr, Pixiv, Pinterest, YouTube, Bilibili, DeviantArt, Facebook, Reddit, and Threads source hosts.
- [ ] The extension requests only `storage`, `activeTab`, `scripting`, and `contextMenus`, plus host access identical to the content-script matches, with no clipboard, history, cookie, or all-sites access.
- [ ] Updating from the previous store version shows no new permission warning.
- [ ] Tabs on supported sites that were open before installing/updating rewrite Copy Link actions without a refresh.
- [ ] Installation opens no welcome or onboarding tab.

## Existing platforms

- [ ] X timeline, direct, and modal Copy Link actions produce the correct `fixupx.com` post URL from `x.com`, `twitter.com`, and `/i/web/status/` shares.
- [ ] Instagram post, Reel, carousel, and modal Copy Link actions produce the correct `oginstagram.com` URL; only valid `img_index` remains.
- [ ] Bluesky feed, direct, reply, quote, handle, and DID post links produce the correct `fxbsky.app` URL.
- [ ] TikTok video and photo posts produce `tnktok.com`; profiles, feeds, live pages, and unrelated routes remain unchanged.
- [ ] Reddit post, comment permalink, and `/s/` share links produce `vxreddit.com`; subreddit/profile/media pages remain unchanged.
- [ ] Current `threads.com` and legacy `threads.net` post links produce `vxthreads.com`; profiles and feeds remain unchanged.

## Shortcut, context menu, and confirmation

- [ ] Alt+Shift+C on an open post copies its Fixed Link and shows the confirmation; on a non-post page it shows an explanatory message.
- [ ] Right-click → **Copy fixed link** works on supported post links, both on supported sites and on unrelated sites (e.g. a link in a chat web app).
- [ ] Right-click anywhere on an open post → **Copy fixed link to this post** works.
- [ ] Undo in the confirmation restores the original link in the clipboard.
- [ ] With the confirmation switch off, automatic rewriting shows nothing on the page.

## Twitch clips

- [ ] A `clips.twitch.tv/{slug}` share and a channel `/clip/{slug}` share both produce the same FixEmbed link.
- [ ] Channel, video, directory, and live pages remain unchanged.

## Tumblr

- [ ] A modern `tumblr.com/{blog}/{postId}` link and a legacy `{blog}.tumblr.com/post/{postId}` link produce the same `tpmblr.com` link.
- [ ] Blog profiles, dashboard routes, and unrelated pages remain unchanged.

## Pixiv

- [ ] Current artwork links, localized artwork links, and legacy `member_illust.php?illust_id=...` links produce the expected `phixiv.net` link.
- [ ] User profiles, novels, discovery pages, and unrelated routes remain unchanged.

## Pinterest

- [ ] A numeric Pin URL from desktop and a regional host produce the expected FixEmbed link.
- [ ] A current `pin.it` share produces a FixEmbed link without tracking parameters.
- [ ] Profiles, boards, searches, and unrelated routes remain unchanged.

## YouTube Community

- [ ] Desktop and mobile `/post/{Ugk...}` Community links produce the expected FixEmbed link.
- [ ] Watch, Shorts, channel, playlist, and unrelated routes remain unchanged.

## Bilibili

- [ ] Current BV and av video URLs produce the expected `vxbilibili.com` link (with `?p=` preserved for multi-part videos).
- [ ] A current `b23.tv` share produces a FixEmbed link without tracking parameters.
- [ ] Space/profile, dynamic, search, and unrelated routes remain unchanged.

## DeviantArt

- [ ] Modern and legacy artist-subdomain artwork links produce the expected `fixdeviantart.com` link; `sta.sh` shares produce a FixEmbed link.
- [ ] Profiles, galleries, collections, and unrelated routes remain unchanged.

## Facebook

- [ ] Public user-post, Reel, `/share/p/`, group-post, story, and permalink routes produce the expected `facebed.com` link when publicly accessible.
- [ ] `story_fbid` and an optional valid `id` remain on story/permalink routes while `mibextid`, locale, ref, and other tracking parameters are removed.
- [ ] Profiles, Marketplace, login, private content, and unrelated routes remain unchanged.

## Cross-platform failure behavior

- [ ] Copying ordinary text, malformed URLs, HTTP URLs, and address-bar URLs remains unchanged; a supported link with only surrounding whitespace is fixed.
- [ ] Unrecognized Copy Link actions preserve the platform's original value.
- [ ] Automatic rewriting produces no navigation, sound, or page modification other than the optional confirmation.

## Popup and settings

- [ ] The master switch and all fourteen platform switches are enabled on first install, and the whole popup fits without scrolling.
- [ ] The master switch pauses all automatic rewriting.
- [ ] Each switch disables only its own platform and persists after Chrome restarts.
- [ ] Manual copying works when that platform's automatic switch is off.
- [ ] The manual action copies a Fixed Link on supported pages and explains unsupported pages.
- [ ] The popup is keyboard-usable and readable in system light and dark modes.
- [ ] The GitHub Issues link opens the correct support page.

## Embed verification

- [ ] Current Fixed Links for X, Instagram, Bluesky, TikTok, Reddit, and Threads produce expected Discord previews.
- [ ] Current Pixiv (Phixiv), Tumblr (fxtumblr), DeviantArt (fixDeviantArt), and Bilibili (vxBilibili) links produce expected Discord previews.
- [ ] Current Twitch, Pinterest, and YouTube Community FixEmbed links produce expected Discord previews.
- [ ] A current Facebook Facebed link produces the expected Discord preview.
- [ ] Image, video, carousel, text, quote, and reply variants render as expected where applicable.

## Release package and disclosures

- [ ] The version number is incremented and the ZIP contains only required extension files.
- [ ] README, privacy policy, product/technical specs, and Chrome Web Store disclosures match actual behavior.
- [ ] The store description accurately names supported content, the shortcut, the context menu, and the local settings.
- [ ] The listing includes the platform, Discord, and Embed Service non-affiliation disclaimer.
