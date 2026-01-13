import {
    getPromiseById,
    getPoliticianBySlug,
    getPartyBySlug,
    getPromisesByPolitician,
    getPromisesByCategory,
    getRandomPromises,
    CategoryUI
} from '@/lib/db';
import { CATEGORIES, Category } from '@/lib/types';
import { PromiseDetailClient } from '@/components/PromiseDetailClient';

interface PageProps {
    params: Promise<{ id: string }>;
}

const PromiseDetailPage = async ({ params }: PageProps) => {
    const { id } = await params;
    const promise = await getPromiseById(id);

    if (!promise) {
        return <PromiseDetailClient
            promise={null} // Cast to any if needed, but client component handles null check for promise object implicitly via if(!promise)
            politician={null}
            party={null}
            category={undefined}
            relatedByPolitician={[]}
            relatedByCategory={[]}
        />;
    }

    const politician = await getPoliticianBySlug(promise.politicianId);
    const party = promise.partyId ? await getPartyBySlug(promise.partyId) : null;

    // promise.category is a string (slug) in PromiseUI.
    // CATEGORIES.find expects id to match Category type.
    const categoryInfo = CATEGORIES.find(c => c.id === promise.category);

    // We need to pass CategoryUI to client. CategoryUI has { id, slug, name, color }.
    // CATEGORIES has { id, name, icon, description }.
    // We need to adapt or just use CategoryUI.
    // PromiseDetailClient expects CategoryUI (from lib/db).
    // Let's construct a CategoryUI object from categoryInfo.

    let category: CategoryUI | undefined = undefined;
    if (categoryInfo) {
        category = {
            id: categoryInfo.id,
            slug: categoryInfo.id,
            name: categoryInfo.name,
        };
    } else {
        // Fallback or maybe promise.category is just the slug
        category = {
            id: promise.category,
            slug: promise.category,
            name: promise.category, // Fallback name
        };
    }

    const relatedByPolitician = await getPromisesByPolitician(promise.politicianId);
    const relatedByPoliticianFiltered = relatedByPolitician
        .filter(p => p.id !== promise.id)
        .slice(0, 2);

    const relatedByCategory = await getPromisesByCategory(promise.category);
    const relatedByCategoryFiltered = relatedByCategory
        .filter(p => p.id !== promise.id && !relatedByPoliticianFiltered.find(r => r.id === p.id))
        .slice(0, 2);

    const relatedCount = relatedByPoliticianFiltered.length + relatedByCategoryFiltered.length;
    let fallbackPromises: any[] = []; // Use any for now or PromiseUI

    // Always fill up to 3 items in sidebar if possible
    if (relatedCount < 3) {
        const remaining = 3 - relatedCount;
        fallbackPromises = await getRandomPromises(remaining, promise.id);
    } // wait, getRandomPromises needs to be imported: done in chunk 1

    return (
        <PromiseDetailClient
            promise={promise}
            politician={politician}
            party={party}
            category={category}
            relatedByPolitician={relatedByPoliticianFiltered}
            relatedByCategory={[...relatedByCategoryFiltered, ...fallbackPromises]}
        />
    );
};

export default PromiseDetailPage;
