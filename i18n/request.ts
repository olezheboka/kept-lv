import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async () => {
    // Latvian-only (public website)
    return {
        locale: 'lv',
        messages: (await import('../messages/lv.json')).default
    };
});
