import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["lv", "en", "ru"],
  defaultLocale: "lv",
  localePrefix: "as-needed",
});
