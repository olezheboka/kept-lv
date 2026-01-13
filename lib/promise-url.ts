import { formatDateForUrl } from './slugify';

/**
 * Interface for promise data needed to generate URL
 */
interface PromiseForUrl {
    slug: string;
    categorySlug: string; // category slug for URL
    datePromised: string | Date;
}

/**
 * Generate the full URL path for a promise detail page
 * Format: /promises/[category-slug]/[dd-mm-yyyy]-[promise-slug]
 * 
 * @param promise Promise data with slug, categorySlug, and datePromised
 * @returns Full URL path for the promise
 */
export function getPromiseUrl(promise: PromiseForUrl): string {
    const dateStr = formatDateForUrl(promise.datePromised);
    return `/promises/${promise.categorySlug}/${dateStr}-${promise.slug}`;
}

