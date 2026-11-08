import { useEffect, useState } from "react";

import { COPY_COMMAND } from "../shared/commands";
import { t, type MessageKey } from "../shared/i18n";
import {
  PLATFORMS,
  platformForHostname,
  platformInfo,
  rewriteSupportedUrl,
  type Platform,
  type PlatformInfo,
  type RewrittenLink,
} from "../shared/platforms";
import {
  DEFAULT_SETTINGS,
  SETTINGS_KEYS,
  settingKeyForPlatform,
  settingsFromStorage,
  type SettingKey,
  type Settings,
} from "../shared/settings";
import { PLATFORM_ICON_PATHS } from "./platformIcons";
import { Switch } from "./Switch";

type CurrentPage =
  | { kind: "loading" }
  | { kind: "post"; link: RewrittenLink; sourceUrl: string }
  | { kind: "platform"; platform: Platform }
  | { kind: "other" };

const ISSUES_URL = "https://github.com/juliobsz/fxeverything/issues";

function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    void chrome.storage.local.get([...SETTINGS_KEYS]).then((stored) => {
      setSettings(settingsFromStorage(stored));
      setLoaded(true);
    }, () => setLoaded(true));

    const onChanged = (
      changes: Record<string, chrome.storage.StorageChange>,
      areaName: string,
    ) => {
      if (areaName !== "local") return;
      setSettings((current) => {
        const next = { ...current };
        for (const key of SETTINGS_KEYS) {
          const value = changes[key]?.newValue;
          if (typeof value === "boolean") next[key] = value;
        }
        return next;
      });
    };

    chrome.storage.onChanged.addListener(onChanged);
    return () => chrome.storage.onChanged.removeListener(onChanged);
  }, []);

  const update = (patch: Partial<Settings>) => {
    setSettings((current) => ({ ...current, ...patch }));
    void chrome.storage.local.set(patch);
  };

  return [settings, update, loaded] as const;
}

function useCurrentPage(): CurrentPage {
  const [page, setPage] = useState<CurrentPage>({ kind: "loading" });

  useEffect(() => {
    void chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
      const url = tab?.url ?? "";
      const link = rewriteSupportedUrl(url);
      if (link) return setPage({ kind: "post", link, sourceUrl: url });

      let platform: Platform | null = null;
      try {
        platform = platformForHostname(new URL(url).hostname);
      } catch {
        platform = null;
      }
      setPage(platform ? { kind: "platform", platform } : { kind: "other" });
    }).catch(() => setPage({ kind: "other" }));
  }, []);

  return page;
}

function useShortcut(): string | null | undefined {
  const [shortcut, setShortcut] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    void chrome.commands?.getAll?.().then((commands) => {
      const command = commands.find((item) => item.name === COPY_COMMAND);
      setShortcut(command?.shortcut || null);
    }).catch(() => setShortcut(null));
  }, []);

  return shortcut;
}

export function App() {
  const [settings, updateSettings, loaded] = useSettings();
  const page = useCurrentPage();
  const shortcut = useShortcut();

  // Avoid flashing defaults before stored settings arrive (a few ms).
  if (!loaded) return <main className="h-[520px] w-[400px] bg-ground" />;

  const enabledCount = PLATFORMS.filter(
    (platform) => settings[settingKeyForPlatform(platform.id)],
  ).length;
  const allOn = enabledCount === PLATFORMS.length;

  const setAllPlatforms = (value: boolean) => {
    updateSettings(Object.fromEntries(
      PLATFORMS.map((platform) => [settingKeyForPlatform(platform.id), value]),
    ) as Partial<Record<SettingKey, boolean>>);
  };

  return (
    <main className="w-[400px] bg-ground p-4 text-ink">
      <header className="flex h-9 items-center gap-2 px-1">
        <img alt="" className="size-5 rounded" src="/icons/icon-32.png" />
        <h1 className="text-[14px] font-medium">Fx Everything</h1>
        <span className="ml-auto text-[12px] text-muted">
          {settings.enabled ? t("popupStatusOn") : t("popupStatusPaused")}
        </span>
        <Switch
          checked={settings.enabled}
          label={settings.enabled ? t("popupPause") : t("popupResume")}
          onChange={(enabled) => updateSettings({ enabled })}
        />
      </header>

      <div className="mt-2 space-y-3">
        <ThisTab page={page} />

        <section aria-labelledby="platforms-title">
          <div className="flex h-8 items-center gap-2 px-1">
            <h2 className="shrink-0 text-[14px] font-medium" id="platforms-title">{t("popupPlatforms")}</h2>
            <span className="num min-w-0 truncate text-[12px] text-muted">{t("popupPlatformCount", enabledCount, PLATFORMS.length)}</span>
            <button
              className="ml-auto shrink-0 cursor-pointer whitespace-nowrap rounded-md px-1.5 py-0.5 text-[12px] font-medium text-ink hover:bg-raised focus-visible:outline-2 focus-visible:outline-ink"
              onClick={() => setAllPlatforms(!allOn)}
              type="button"
            >
              {allOn ? t("popupTurnAllOff") : t("popupTurnAllOn")}
            </button>
          </div>
          <ul
            className={`grid grid-cols-2 overflow-hidden rounded-lg border border-border bg-surface transition-opacity ${
              settings.enabled ? "" : "opacity-60"
            }`}
          >
            {PLATFORMS.map((platform, index) => {
              const key = settingKeyForPlatform(platform.id);
              return (
                <li
                  className={`${index % 2 === 0 ? "border-r border-rule" : ""} ${index >= 2 ? "border-t border-rule" : ""}`}
                  key={platform.id}
                >
                  <PlatformRow
                    checked={settings[key]}
                    onChange={(value) => updateSettings({ [key]: value })}
                    platform={platform}
                  />
                </li>
              );
            })}
          </ul>
        </section>

        <section aria-label={t("popupPreferences")} className="divide-y divide-rule rounded-lg border border-border bg-surface">
          <div className="flex h-11 items-center gap-2 px-3">
            <span className="flex-1 text-[14px]">{t("popupShortcut")}</span>
            {shortcut ? (
              <kbd className="num rounded bg-raised px-1.5 py-0.5 font-sans text-[12px] text-ink">
                {shortcut.replaceAll("+", " + ")}
              </kbd>
            ) : shortcut === null ? (
              <span className="text-[12px] text-muted">{t("popupShortcutNotSet")}</span>
            ) : null}
            <button
              className="cursor-pointer rounded-md px-1.5 py-0.5 text-[12px] font-medium hover:bg-raised focus-visible:outline-2 focus-visible:outline-ink"
              onClick={() => void chrome.tabs.create({ url: "chrome://extensions/shortcuts" })}
              type="button"
            >
              {shortcut ? t("popupShortcutChange") : t("popupShortcutSet")}
            </button>
          </div>
          <div className="flex items-center gap-3 px-3 py-2.5">
            <span className="flex-1">
              <span className="block text-[14px]">{t("popupConfirmation")}</span>
              <span className="block text-[12px] leading-4 text-muted">{t("popupConfirmationDetail")}</span>
            </span>
            <Switch
              checked={settings.showToast}
              label={t("popupConfirmationLabel")}
              onChange={(showToast) => updateSettings({ showToast })}
            />
          </div>
        </section>
      </div>

      <footer className="mt-2 flex h-7 items-center justify-between px-1 text-[12px] text-muted">
        <span className="num">{t("popupVersion", chrome.runtime.getManifest?.().version ?? "")}</span>
        <a className="rounded hover:text-ink hover:underline focus-visible:outline-2 focus-visible:outline-ink" href={ISSUES_URL} rel="noopener noreferrer" target="_blank">
          {t("popupReport")}
        </a>
      </footer>
    </main>
  );
}

function ThisTab({ page }: { page: CurrentPage }) {
  const [copied, setCopied] = useState<"idle" | "copied" | "failed">("idle");

  useEffect(() => {
    if (copied === "idle") return;
    const timer = setTimeout(() => setCopied("idle"), 1600);
    return () => clearTimeout(timer);
  }, [copied]);

  if (page.kind === "loading") {
    return <div aria-hidden className="h-[124px] rounded-lg border border-border bg-surface" />;
  }

  if (page.kind !== "post") {
    const info = page.kind === "platform" ? platformInfo(page.platform) : null;
    return (
      <section aria-label={t("popupThisTab")} className="rounded-lg border border-border bg-surface px-3 py-3">
        <div className="flex items-center gap-2">
          {info && <PlatformIcon className="size-4" platform={info.id} />}
          <p className="text-[13px] font-medium">
            {info ? t("popupNotPostTitle", info.name) : t("popupNoPostTitle")}
          </p>
        </div>
        <p className="mt-1 text-[13px] leading-5 text-muted">
          {info
            ? t("popupNotPostBody", info.name)
            : t("popupNoPostBody")}
        </p>
      </section>
    );
  }

  const { fixedUrl, platform } = page.link;
  const info = platformInfo(platform);
  const fixed = new URL(fixedUrl);
  const fixedRest = fixedUrl.slice(`https://${fixed.host}`.length);
  const source = page.sourceUrl.replace(/^https:\/\/(www\.)?/, "");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(fixedUrl);
      setCopied("copied");
    } catch {
      setCopied("failed");
    }
  };

  return (
    <section aria-label={t("popupThisTab")} className="rounded-lg border border-border bg-surface p-3">
      <div className="flex items-center gap-2">
        <PlatformIcon className="size-4" platform={platform} />
        <p className="text-[14px] font-medium">{t("popupPostTitle", info.name)}</p>
      </div>

      <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 text-[13px] leading-5">
        <dt className="text-muted">{t("popupFrom")}</dt>
        <dd className="truncate text-muted" title={page.sourceUrl}>{source}</dd>
        <dt className="text-muted">{t("popupTo")}</dt>
        <dd className="truncate" title={fixedUrl}>
          <span className="font-medium text-hue">{fixed.host}</span>
          <span>{fixedRest}</span>
        </dd>
      </dl>

      <div className="mt-3 flex gap-2">
        <button
          className="h-8 flex-1 cursor-pointer rounded-md bg-primary px-3 text-[13px] font-medium text-on-primary transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink active:opacity-75"
          onClick={() => void copy()}
          type="button"
        >
          {copied === "copied" ? t("popupCopied") : copied === "failed" ? t("popupCopyFailed") : t("popupCopy")}
        </button>
        <a
          className="flex h-8 items-center rounded-md bg-secondary px-3 text-[13px] font-medium hover:bg-secondary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          href={fixedUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          {t("popupPreview")}
        </a>
      </div>
    </section>
  );
}

function PlatformRow({
  checked,
  onChange,
  platform,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  platform: PlatformInfo;
}) {
  return (
    <div
      className="flex h-9 items-center gap-2 px-3"
      title={`${t(`covers_${platform.id}` as MessageKey)} → ${platform.service}`}
    >
      <PlatformIcon className={`size-4 transition-colors ${checked ? "text-ink" : "text-muted"}`} platform={platform.id} />
      <span className={`min-w-0 flex-1 truncate text-[14px] ${checked ? "" : "text-muted"}`}>
        {platform.name.replace(" / Twitter", "")}
      </span>
      <Switch
        checked={checked}
        label={t("popupPlatformToggle", platform.name)}
        onChange={onChange}
      />
    </div>
  );
}

function PlatformIcon({ platform, className = "" }: { platform: Platform; className?: string }) {
  return (
    <svg aria-hidden className={`shrink-0 ${className}`} fill="currentColor" viewBox="0 0 24 24">
      <path d={PLATFORM_ICON_PATHS[platform]} />
    </svg>
  );
}
