
process.env.DATABASE_URL = process.env.DATABASE_URL || "postgres://default:A6bY4TfVdJgO@ep-icy-waterfall-a4001956-pooler.us-east-1.aws.neon.tech:5432/verceldb?sslmode=require&pgbouncer=true&connect_timeout=15";

import { prisma } from '../lib/prisma';
import { getPromisesByPolitician, getPromisesByCategory, getRandomPromises } from '../lib/db';


async function checkPromiseLayoutLogic(limit: number = 5) {
    console.log(`Checking layout logic for ${limit} random promises...`);

    const promises = await prisma.promise.findMany({
        take: limit,
        select: { id: true, politicianId: true, categoryId: true, category: true }
    });

    for (const p of promises) {
        console.log(`\nChecking Promise ID: ${p.id}`);
        // Simulate page.tsx logic
        const politicianId = p.politicianId;
        const categorySlug = p.category ? p.category.slug : undefined;

        if (!categorySlug) {
            console.log("  Skipping: Category relation missing or no slug");
            continue;
        }

        const relatedByPolitician = politicianId ? await getPromisesByPolitician(politicianId) : [];
        const relatedByPoliticianFiltered = relatedByPolitician
            .filter(r => r.id !== p.id)
            .slice(0, 2);

        const relatedByCategory = await getPromisesByCategory(categorySlug);
        const relatedByCategoryFiltered = relatedByCategory
            .filter(r => r.id !== p.id && !relatedByPoliticianFiltered.find(existing => existing.id === r.id))
            .slice(0, 2);

        const relatedCount = relatedByPoliticianFiltered.length + relatedByCategoryFiltered.length;
        let fallbackCount = 0;

        if (relatedCount < 3) {
            const remaining = 3 - relatedCount;
            const fallback = await getRandomPromises(remaining, p.id);
            fallbackCount = fallback.length;
        }

        const totalSidebar = relatedCount + fallbackCount;

        console.log(`  Related (Pol): ${relatedByPoliticianFiltered.length}`);
        console.log(`  Related (Cat): ${relatedByCategoryFiltered.length}`);
        console.log(`  Fallback: ${fallbackCount}`);
        console.log(`  Total Sidebar Items: ${totalSidebar}`);

        const totalPromisesInDb = await prisma.promise.count();

        if (totalSidebar < 3 && totalPromisesInDb >= 4) {
            console.error("  FAIL: Sidebar has fewer than 3 items despite sufficient data.");
        } else {
            console.log("  PASS: Sidebar logic holds.");
        }
    }
}

checkPromiseLayoutLogic()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
