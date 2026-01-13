/**
 * Utility functions for generating URL-safe slugs
 */

/**
 * Latvian character map for transliteration
 */
const latvianCharMap: Record<string, string> = {
    'ā': 'a', 'č': 'c', 'ē': 'e', 'ģ': 'g', 'ī': 'i', 'ķ': 'k',
    'ļ': 'l', 'ņ': 'n', 'š': 's', 'ū': 'u', 'ž': 'z',
    'Ā': 'a', 'Č': 'c', 'Ē': 'e', 'Ģ': 'g', 'Ī': 'i', 'Ķ': 'k',
    'Ļ': 'l', 'Ņ': 'n', 'Š': 's', 'Ū': 'u', 'Ž': 'z',
};

/**
 * Generate a URL-safe slug from a string
 * @param text The text to slugify
 * @returns URL-safe slug
 */
export function slugify(text: string): string {
    let result = text.toLowerCase();

    // Replace Latvian characters
    for (const [char, replacement] of Object.entries(latvianCharMap)) {
        result = result.replace(new RegExp(char, 'g'), replacement);
    }

    return result
        // Replace spaces and underscores with hyphens
        .replace(/[\s_]+/g, '-')
        // Remove all non-alphanumeric characters except hyphens
        .replace(/[^a-z0-9-]/g, '')
        // Remove multiple consecutive hyphens
        .replace(/-+/g, '-')
        // Remove leading/trailing hyphens
        .replace(/^-|-$/g, '')
        // Limit length
        .substring(0, 100);
}

/**
 * Format a date as dd-mm-yyyy for URL
 * @param date Date to format
 * @returns Formatted date string
 */
export function formatDateForUrl(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
}

/**
 * Parse a date from dd-mm-yyyy URL format
 * @param dateStr Date string in dd-mm-yyyy format
 * @returns Date object or null if invalid
 */
export function parseDateFromUrl(dateStr: string): Date | null {
    const match = dateStr.match(/^(\d{2})-(\d{2})-(\d{4})$/);
    if (!match) return null;

    const [, day, month, year] = match;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

    // Validate the date is real
    if (
        date.getDate() !== parseInt(day) ||
        date.getMonth() !== parseInt(month) - 1 ||
        date.getFullYear() !== parseInt(year)
    ) {
        return null;
    }

    return date;
}
