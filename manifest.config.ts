import { defineManifest } from "@crxjs/vite-plugin";

import packageJson from "./package.json";
import { COPY_COMMAND, DEFAULT_COPY_SHORTCUT } from "./src/shared/commands";
import { SUPPORTED_PAGE_MATCHES } from "./src/shared/platforms";

const supportedPages = [...SUPPORTED_PAGE_MATCHES];

export default defineManifest({
  manifest_version: 3,
  // Texts come from public/_locales/<locale>/messages.json (en, pt_BR).
  default_locale: "en",
  name: "__MSG_extName__",
  short_name: "__MSG_extShortName__",
  description: "__MSG_extDescription__",
  version: packageJson.version,
  minimum_chrome_version: "111",
  permissions: ["storage", "activeTab", "scripting", "contextMenus"],
  // Same sites the content scripts already run on; needed to inject into tabs
  // that were open before install/update so nothing requires a refresh.
  host_permissions: supportedPages,
  icons: {
    16: "icons/icon-16.png",
    32: "icons/icon-32.png",
    48: "icons/icon-48.png",
    128: "icons/icon-128.png",
  },
  background: {
    service_worker: "src/background.ts",
    type: "module",
  },
  action: {
    default_title: "__MSG_extShortName__",
    default_popup: "popup.html",
    default_icon: {
      16: "icons/icon-16.png",
      32: "icons/icon-32.png",
    },
  },
  commands: {
    [COPY_COMMAND]: {
      suggested_key: { default: DEFAULT_COPY_SHORTCUT },
      description: "__MSG_commandCopy__",
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
      js: ["src/content/settings-bridge.iife.ts"],
      run_at: "document_start",
      world: "ISOLATED",
    },
  ],
});
