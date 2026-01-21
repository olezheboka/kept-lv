import {
    getPromiseBySlug,
    getPoliticianBySlug,
    getPartyBySlug,
    getPromisesByPolitician,
    getPromisesByCategory,
    CategoryUI,
    PromiseUI,
    PoliticianUI,
    PartyUI
} from '@/lib/db';
import { CATEGORIES } from '@/lib/types';
import { PromiseDetailClient } from '@/components/PromiseDetailClient';
import { notFound } from 'next/navigation';

interface PageProps {
    params: Promise<{ categorySlug: string; dateSlug: string }>;
}

export const revalidate = 60;

const PromiseDetailPage = async ({ params }: PageProps) => {
    const { categorySlug, dateSlug } = await params;

    // dateSlug format: dd-mm-yyyy-promise-slug
    // Extract the date part and promise slug
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

    let promise: PromiseUI | null = null;
    let politician: PoliticianUI | null = null;
    let party: PartyUI | null = null;
    let category: CategoryUI | undefined = undefined;
    let relatedByPolitician: PromiseUI[] = [];
    let relatedByCategory: PromiseUI[] = [];

    promise = await getPromiseBySlug(categorySlug, promiseSlug);

    if (!promise) {
        notFound();
    }

    const currentPromise = promise; // Ensure type safety
    politician = currentPromise.politicianId ? await getPoliticianBySlug(currentPromise.politicianId) : null;
    party = currentPromise.partyId ? await getPartyBySlug(currentPromise.partyId) : null;

    const categoryInfo = CATEGORIES.find(c => c.id === currentPromise.categorySlug);
    if (categoryInfo) {
        category = {
            id: categoryInfo.id,
            slug: categoryInfo.id,
            name: categoryInfo.name,
        };
    }

    const [relatedPol, relatedCat] = await Promise.all([
        currentPromise.politicianId ? getPromisesByPolitician(currentPromise.politicianId, "lv", 4) : Promise.resolve([]),
        getPromisesByCategory(currentPromise.categorySlug, "lv", 4),
    ]);

    // Filter out current promise from related
    relatedByPolitician = relatedPol
        .filter(p => p.id !== currentPromise.id)
        .slice(0, 3);
    relatedByCategory = relatedCat
        .filter(p => p.id !== currentPromise.id)
        .slice(0, 3);

    return (
        <PromiseDetailClient
            promise={promise}
            politician={politician}
            party={party}
            category={category}
            relatedByPolitician={relatedByPolitician}
            relatedByCategory={relatedByCategory}
        />
    );
};

export default PromiseDetailPage;
