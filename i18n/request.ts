import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ requestLocale }) => {
    let locale = await requestLocale;

    if (!locale || !['en', 'lv', 'ru'].includes(locale)) {
        locale = 'lv';
    }

    return {
        locale,
        messages: (await import(`../messages/${locale}.json`)).default
    };
});
