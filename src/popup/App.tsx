import { useEffect, useState } from "react";
import { rewriteSupportedUrl } from "../shared/platforms";
import {
  DEFAULT_SETTINGS,
  SETTINGS_KEYS,
  settingsFromStorage,
  type Settings,
} from "../shared/settings";
import { Switch } from "./Switch";

type CopyState = "idle" | "copying" | "copied" | "unsupported" | "failed";

const COPY_LABELS: Record<CopyState, string> = {
  idle: "Copy fixed link for this page",
  copying: "Copying…",
  copied: "Copied",
  unsupported: "This page isn't a supported post",
  failed: "Couldn't copy this link",
};

function booleanChange(change: chrome.storage.StorageChange | undefined, fallback: boolean,): boolean {
  return typeof change?.newValue === "boolean" ? change.newValue : fallback;
}

export function App() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [copyState, setCopyState] = useState<CopyState>('idle');

  useEffect(() => {
    void chrome.storage.local
      .get([...SETTINGS_KEYS])
      .then((stored) => {
        setSettings(settingsFromStorage(stored));
      });

    const handleStorageChange = (
      changes: Record<string, chrome.storage.StorageChange>,
      areaName: string,
    ) => {
      if (areaName !== "local") return;

      setSettings((current) => ({
        autoFixBluesky: booleanChange(
          changes.autoFixBluesky,
          current.autoFixBluesky,
        ),
        autoFixInstagram: booleanChange(
          changes.autoFixInstagram,
          current.autoFixInstagram,
        ),
        autoFixReddit: booleanChange(
          changes.autoFixReddit,
          current.autoFixReddit,
        ),
        autoFixThreads: booleanChange(
          changes.autoFixThreads,
          current.autoFixThreads,
        ),
        autoFixTikTok: booleanChange(
          changes.autoFixTikTok,
          current.autoFixTikTok,
        ),
        autoFixX: booleanChange(changes.autoFixX, current.autoFixX),
      }));
    };

    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => chrome.storage.onChanged.removeListener(handleStorageChange);
  }, []);

  const updateSetting = <Key extends keyof Settings>(
    key: Key,
    value: Settings[Key],
  ) => {
    setSettings((current) => ({ ...current, [key]: value }));
    void chrome.storage.local.set({ [key]: value });
  };

  const copyCurrentPage = async () => {
    setCopyState("copying");

    try {
      const [activeTab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      const rewritten = activeTab?.url
        ? rewriteSupportedUrl(activeTab.url)
        : null;

      if (!rewritten) {
        setCopyState("unsupported");
        return;
      }

      await navigator.clipboard.writeText(rewritten.fixedUrl);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  };

  return (
    <main className="w-88 bg-light p-4 text-stone-950 dark:bg-[#0A0A10] dark:text-stone-50">
      <header className="flex items-center justify-between gap-3 border-b border-stone-200 pb-4 dark:border-stone-800">
        <h1 className="text-xl font-semibold tracking-[-0.02em]">
          FxEverything
        </h1>
        <a aria-label="Open FxEverything issues" className="cursor-pointer text-stone-950 dark:text-white" href="https://github.com/juliobsz/fxeverything/issues" target="_blank" rel="noopener noreferrer">
          <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="30" height="30" viewBox="0 0 30 30">
            <path fill="currentColor" d="M15,3C8.373,3,3,8.373,3,15c0,5.623,3.872,10.328,9.092,11.63C12.036,26.468,12,26.28,12,26.047v-2.051 c-0.487,0-1.303,0-1.508,0c-0.821,0-1.551-0.353-1.905-1.009c-0.393-0.729-0.461-1.844-1.435-2.526 c-0.289-0.227-0.069-0.486,0.264-0.451c0.615,0.174,1.125,0.596,1.605,1.222c0.478,0.627,0.703,0.769,1.596,0.769 c0.433,0,1.081-0.025,1.691-0.121c0.328-0.833,0.895-1.6,1.588-1.962c-3.996-0.411-5.903-2.399-5.903-5.098 c0-1.162,0.495-2.286,1.336-3.233C9.053,10.647,8.706,8.73,9.435,8c1.798,0,2.885,1.166,3.146,1.481C13.477,9.174,14.461,9,15.495,9 c1.036,0,2.024,0.174,2.922,0.483C18.675,9.17,19.763,8,21.565,8c0.732,0.731,0.381,2.656,0.102,3.594 c0.836,0.945,1.328,2.066,1.328,3.226c0,2.697-1.904,4.684-5.894,5.097C18.199,20.49,19,22.1,19,23.313v2.734 c0,0.104-0.023,0.179-0.035,0.268C23.641,24.676,27,20.236,27,15C27,8.373,21.627,3,15,3z"></path>
          </svg>
        </a>
      </header>

      <section
        aria-label="Automatic link fixing"
        className="divide-y divide-stone-200 dark:divide-stone-800"
      >
        <Switch
          checked={settings.autoFixX}
          label="Fix X links automatically"
          onChange={(checked) => updateSetting("autoFixX", checked)}
        />
        <Switch
          checked={settings.autoFixInstagram}
          label="Fix Instagram links automatically"
          onChange={(checked) =>
            updateSetting("autoFixInstagram", checked)
          }
        />
        <Switch
          checked={settings.autoFixBluesky}
          label="Fix Bluesky links automatically"
          onChange={(checked) => updateSetting("autoFixBluesky", checked)}
        />
        <Switch
          checked={settings.autoFixTikTok}
          label="Fix TikTok links automatically"
          onChange={(checked) => updateSetting("autoFixTikTok", checked)}
        />
        <Switch
          checked={settings.autoFixReddit}
          label="Fix Reddit links automatically"
          onChange={(checked) => updateSetting("autoFixReddit", checked)}
        />
        <Switch
          checked={settings.autoFixThreads}
          label="Fix Threads links automatically"
          onChange={(checked) => updateSetting("autoFixThreads", checked)}
        />
      </section>

      <button
        className="cursor-pointer disabled:cursor-wait mt-3 min-h-11 w-full rounded-xl bg-stone-950 px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-stone-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 disabled:opacity-70 dark:bg-orange-500 dark:text-stone-950 dark:hover:bg-orange-400"
        disabled={copyState === "copying"}
        onClick={() => void copyCurrentPage()}
        type="button"
      >
        {COPY_LABELS[copyState]}
      </button>
    </main>
  );
}
