import { expect, test } from "bun:test";

import en from "../public/_locales/en/messages.json";
import ptBR from "../public/_locales/pt_BR/messages.json";
import { PLATFORMS } from "../src/shared/platforms.ts";
import { t } from "../src/shared/i18n.ts";

type Catalog = Record<string, { message: string }>;
const catalogs: Record<string, Catalog> = { en, pt_BR: ptBR };
const placeholders = (text: string) => [...text.matchAll(/\$[1-9]/g)].map((match) => match[0]).sort();

test("every locale has exactly the English keys", () => {
  for (const [locale, catalog] of Object.entries(catalogs)) {
    expect(Object.keys(catalog).sort(), locale).toEqual(Object.keys(en).sort());
  }
});

test("translations keep the same $1..$9 placeholders and are never empty", () => {
  for (const [locale, catalog] of Object.entries(catalogs)) {
    for (const [key, { message }] of Object.entries(en as Catalog)) {
      expect(catalog[key].message.trim().length, `${locale}.${key}`).toBeGreaterThan(0);
      expect(placeholders(catalog[key].message), `${locale}.${key}`).toEqual(placeholders(message));
    }
  }
});

// Hard Web Store limits. (Chrome only *recommends* 12 characters for the
// short name; "Fx Everything" is 13 by choice.)
test("Web Store limits are respected (name 75, description 132)", () => {
  for (const [locale, catalog] of Object.entries(catalogs)) {
    expect(catalog.extName.message.length, locale).toBeLessThanOrEqual(75);
    expect(catalog.extDescription.message.length, locale).toBeLessThanOrEqual(132);
  }
});

test("every platform has a translated description", () => {
  for (const platform of PLATFORMS) {
    expect((en as Catalog)[`covers_${platform.id}`], platform.id).toBeDefined();
  }
});

test("t() falls back to English with substitutions outside the extension", () => {
  expect(t("popupPlatformCount", 12, 14)).toBe("12 of 14 fixed automatically");
  expect(t("popupPostTitle", "Reddit")).toBe("Reddit post");
});
