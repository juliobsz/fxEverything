import {
  platformInfo,
  rewriteSupportedUrl,
  SUPPORTED_PAGE_MATCHES,
} from "./shared/platforms";
import { COPY_COMMAND } from "./shared/commands";
import { t } from "./shared/i18n";
import { showToast, type ToastOptions } from "./shared/toast";

const MENU_PAGE = "fxeverything-copy-page";
const MENU_LINK = "fxeverything-copy-link";

chrome.runtime.onInstalled.addListener((details) => {
  createContextMenus();
  if (details.reason === "install" || details.reason === "update") {
    void injectIntoOpenTabs();
  }
});

chrome.commands.onCommand.addListener((command, tab) => {
  if (command !== COPY_COMMAND) return;
  void (async () => {
    const target = tab?.id !== undefined
      ? tab
      : (await chrome.tabs.query({ active: true, currentWindow: true }))[0];
    if (target?.id === undefined) return;
    await copyFixedLink(target.id, target.url ?? "", "page");
  })();
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (tab?.id === undefined) return;
  if (info.menuItemId === MENU_LINK && info.linkUrl) {
    void copyFixedLink(tab.id, info.linkUrl, "link");
  } else if (info.menuItemId === MENU_PAGE) {
    void copyFixedLink(tab.id, info.pageUrl ?? tab.url ?? "", "page");
  }
});

function createContextMenus(): void {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: MENU_LINK,
      title: t("menuCopyLink"),
      contexts: ["link"],
      targetUrlPatterns: [...SUPPORTED_PAGE_MATCHES],
    });
    chrome.contextMenus.create({
      id: MENU_PAGE,
      title: t("menuCopyPage"),
      contexts: ["page", "selection", "image", "video"],
      documentUrlPatterns: [...SUPPORTED_PAGE_MATCHES],
    });
  });
}

async function copyFixedLink(tabId: number, sourceUrl: string, kind: "page" | "link"): Promise<void> {
  const rewritten = rewriteSupportedUrl(sourceUrl);

  if (!rewritten) {
    await notify(tabId, {
      tone: "error",
      title: kind === "page" ? t("toastNotPost") : t("toastNotSupportedLink"),
      detail: kind === "page" ? t("toastNotPostDetail") : undefined,
    });
    return;
  }

  const copied = await writeClipboardInTab(tabId, rewritten.fixedUrl);
  await notify(tabId, copied
    ? {
      title: t("toastCopied"),
      detail: `${platformInfo(rewritten.platform).name} → ${new URL(rewritten.fixedUrl).hostname}`,
    }
    : { tone: "error", title: t("toastCopyFailed"), detail: t("toastCopyFailedDetail") });
}

async function writeClipboardInTab(tabId: number, text: string): Promise<boolean> {
  try {
    const [result] = await chrome.scripting.executeScript({
      target: { tabId },
      args: [text],
      func: async (value: string) => {
        try {
          await navigator.clipboard.writeText(value);
          return true;
        } catch {
          // Fall back to the legacy path when the async API is blocked.
          const area = document.createElement("textarea");
          area.value = value;
          area.setAttribute("readonly", "");
          area.style.cssText = "position:fixed;top:-1000px;opacity:0;";
          document.documentElement.append(area);
          area.select();
          const ok = document.execCommand("copy");
          area.remove();
          return ok;
        }
      },
    });
    return result?.result === true;
  } catch {
    return false;
  }
}

async function notify(tabId: number, options: ToastOptions): Promise<void> {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      args: [options],
      func: showToast,
    });
  } catch {
    // Pages like chrome:// can't be scripted: fall back to a brief badge.
    const ok = options.tone !== "error";
    await chrome.action.setBadgeBackgroundColor({ tabId, color: ok ? "#16a34a" : "#dc2626" });
    await chrome.action.setBadgeText({ tabId, text: ok ? "✓" : "!" });
    setTimeout(() => void chrome.action.setBadgeText({ tabId, text: "" }), 2500);
  }
}

/**
 * Content scripts declared in the manifest only run on pages loaded after the
 * extension is installed or updated. Inject them into already-open tabs so
 * the extension works immediately, without a refresh.
 */
async function injectIntoOpenTabs(): Promise<void> {
  const scripts = chrome.runtime.getManifest().content_scripts ?? [];
  const tabs = await chrome.tabs.query({ url: [...SUPPORTED_PAGE_MATCHES] });

  await Promise.all(tabs.map(async (tab) => {
    if (tab.id === undefined || tab.discarded || tab.status === "unloaded") return;

    for (const script of scripts) {
      if (!script.js?.length) continue;
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: script.js,
          world: (script as { world?: chrome.scripting.ExecutionWorld }).world ?? "ISOLATED",
          injectImmediately: true,
        });
      } catch {
        // Tab navigated away, crashed, or is otherwise not scriptable.
      }
    }
  }));
}
