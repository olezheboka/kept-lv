import {
    getPromiseById,
    getPoliticianBySlug,
    getPartyBySlug,
    getPromisesByPolitician,
    getPromisesByCategory,
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
    const party = await getPartyBySlug(promise.partyId);

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
            color: "gray" // Default color or map it
        };
    } else {
        // Fallback or maybe promise.category is just the slug
        category = {
            id: promise.category,
            slug: promise.category,
            name: promise.category, // Fallback name
            color: "gray"
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

    return (
        <PromiseDetailClient
            promise={promise}
            politician={politician}
            party={party}
            category={category}
            relatedByPolitician={relatedByPoliticianFiltered}
            relatedByCategory={relatedByCategoryFiltered}
        />
    );
};

export default PromiseDetailPage;
