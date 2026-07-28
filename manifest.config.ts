import { defineManifest } from "@crxjs/vite-plugin";

import packageJson from "./package.json";

const supportedPages = [
  "https://x.com/*",
  "https://instagram.com/*",
  "https://www.instagram.com/*",
];

export default defineManifest({
  manifest_version: 3,
  name: "FxEverything — Better Social Embeds",
  short_name: "FxEverything",
  description:
    "Silently copy richer embed links from X and Instagram share actions.",
  version: packageJson.version,
  minimum_chrome_version: "111",
  permissions: ["storage", "activeTab"],
  icons: {
    16: "icons/icon-16.png",
    32: "icons/icon-32.png",
    48: "icons/icon-48.png",
    128: "icons/icon-128.png",
  },
  action: {
    default_title: "FxEverything",
    default_popup: "popup.html",
    default_icon: {
      16: "icons/icon-16.png",
      32: "icons/icon-32.png",
    },
  },
  content_scripts: [
    {
      matches: supportedPages,
      js: ["src/content/main.iife.ts"],
      run_at: "document_start",
      world: "MAIN",
    },
    {
      matches: supportedPages,
      js: ["src/content/settings-bridge.ts"],
      run_at: "document_start",
      world: "ISOLATED",
    },
  ],
});
