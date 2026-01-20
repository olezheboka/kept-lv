import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
    // Latvian-only (public website)
    locales: ['lv'],
    defaultLocale: 'lv',
    localePrefix: 'never'
});
