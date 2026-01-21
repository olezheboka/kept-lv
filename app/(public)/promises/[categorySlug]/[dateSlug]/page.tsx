import {
    getPromiseBySlug,
    getPoliticianBySlug,
    getPartyBySlug,
    getPromisesByPolitician,
    getPromisesByCategory,
    CategoryUI
} from '@/lib/db';
import { CATEGORIES } from '@/lib/types';
import { PromiseDetailClient } from '@/components/PromiseDetailClient';

interface PageProps {
    params: Promise<{ categorySlug: string; dateSlug: string }>;
}

const PromiseDetailPage = async ({ params }: PageProps) => {
    const { categorySlug, dateSlug } = await params;

    // dateSlug format: dd-mm-yyyy-promise-slug
    // Extract the date part and promise slug
    const dateMatch = dateSlug.match(/^(\d{2}-\d{2}-\d{4})-(.+)$/);

    if (!dateMatch) {
        return <PromiseDetailClient
            promise={null}
            politician={null}
            party={null}
            category={undefined}
            relatedByPolitician={[]}
            relatedByCategory={[]}
        />;
    }

    const [, , promiseSlug] = dateMatch;

    try {
        const promise = await getPromiseBySlug(categorySlug, promiseSlug);

        if (!promise) {
            return <PromiseDetailClient
                promise={null}
                politician={null}
                party={null}
                category={undefined}
                relatedByPolitician={[]}
                relatedByCategory={[]}
            />;
        }

        const politician = promise.politicianId ? await getPoliticianBySlug(promise.politicianId) : null;
        const party = promise.partyId ? await getPartyBySlug(promise.partyId) : null;

        const categoryInfo = CATEGORIES.find(c => c.id === promise.categorySlug);

        let category: CategoryUI | undefined = undefined;
        if (categoryInfo) {
            category = {
                id: categoryInfo.id,
                slug: categoryInfo.id,
                name: categoryInfo.name,
            };
        }

        const [relatedByPolitician, relatedByCategory] = await Promise.all([
            promise.politicianId ? getPromisesByPolitician(promise.politicianId) : Promise.resolve([]),
            getPromisesByCategory(promise.categorySlug),
        ]);

        // Filter out current promise from related
        const filteredRelatedByPolitician = relatedByPolitician
            .filter(p => p.id !== promise.id)
            .slice(0, 3);
        const filteredRelatedByCategory = relatedByCategory
            .filter(p => p.id !== promise.id)
            .slice(0, 3);

        return (
            <PromiseDetailClient
                promise={promise}
                politician={politician}
                party={party}
                category={category}
                relatedByPolitician={filteredRelatedByPolitician}
                relatedByCategory={filteredRelatedByCategory}
            />
        );
    } catch (error) {
        console.error("Error fetching promise detail:", error);
        return <PromiseDetailClient
            promise={null}
            politician={null}
            party={null}
            category={undefined}
            relatedByPolitician={[]}
            relatedByCategory={[]}
        />;
    }
};

export default PromiseDetailPage;
