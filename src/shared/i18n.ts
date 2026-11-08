/**
 * Translations live in public/_locales/<locale>/messages.json (Chrome's
 * built-in i18n). English is the default locale and the source of the key
 * type, so a missing or misspelled key fails the typecheck.
 *
 * Not usable from the MAIN-world content script (no chrome.i18n there); the
 * settings bridge passes it the few strings it needs.
 */
import en from "../../public/_locales/en/messages.json";

export type MessageKey = keyof typeof en;

export function t(key: MessageKey, ...substitutions: Array<string | number>): string {
  const values = substitutions.map(String);
  try {
    const translated = globalThis.chrome?.i18n?.getMessage(key, values);
    if (translated) return translated;
  } catch {
    // Fall through to English (tests, previews, orphaned contexts).
  }
  return en[key].message.replace(/\$([1-9])/g, (_, index: string) => values[Number(index) - 1] ?? "");
}

export function uiLanguage(): string {
  try {
    return globalThis.chrome?.i18n?.getUILanguage?.() || "en";
  } catch {
    return "en";
  }
}
