import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
    // A list of all locales that are supported
    locales: ['en', 'lv', 'ru'],

    // Used when no locale matches
    defaultLocale: 'lv',
    localePrefix: 'never'
});
