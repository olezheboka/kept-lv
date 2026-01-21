/**
 * Script to generate slugs for existing promises
 * Run with: npx tsx scripts/generate-promise-slugs.ts
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { PrismaClient } from '@prisma/client';
import { slugify } from '../lib/slugify';

const prisma = new PrismaClient();

async function generatePromiseSlugs() {
    console.log('Fetching promises without slugs...');

    const promises = await prisma.promise.findMany({
        where: { slug: null },
        include: { category: true },
    });

    console.log(`Found ${promises.length} promises without slugs`);

    for (const promise of promises) {
        // Get localized title (assuming it's stored as JSON with 'lv' key)
        let titleText = '';
        if (typeof promise.title === 'object' && promise.title !== null) {
            const titleObj = promise.title as Record<string, string>;
            titleText = titleObj['lv'] || titleObj['en'] || Object.values(titleObj)[0] || '';
        } else {
            titleText = String(promise.title);
        }

        // Generate base slug from title
        let baseSlug = slugify(titleText);

        // If slug is empty, use the id as fallback
        if (!baseSlug) {
            baseSlug = promise.id.substring(0, 20);
        }

        // Ensure uniqueness by checking for existing slugs
        let slug = baseSlug;
        let counter = 1;

        while (true) {
            const existing = await prisma.promise.findUnique({
                where: { slug },
            });

            if (!existing || existing.id === promise.id) {
                break;
            }

            slug = `${baseSlug}-${counter}`;
            counter++;
        }

        // Update the promise with the new slug
        await prisma.promise.update({
            where: { id: promise.id },
            data: { slug },
        });

        console.log(`  ✓ ${promise.id.substring(0, 8)}... -> ${slug}`);
    }

    console.log('\nDone! All promises now have slugs.');
}

generatePromiseSlugs()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
