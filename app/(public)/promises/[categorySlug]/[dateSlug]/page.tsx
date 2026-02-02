import {
    getPromiseBySlug,
    getPoliticianBySlug,
    getPartyBySlug,
    getRelatedPromises,
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

// export const revalidate = 60;
export const dynamic = 'force-dynamic';

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
            relatedPromises={[]}
        />;
    }

    const [, , promiseSlug] = dateMatch;

    let promise: PromiseUI | null = null;
    let politician: PoliticianUI | null = null;
    let party: PartyUI | null = null;
    let category: CategoryUI | undefined = undefined;
    let relatedPromises: PromiseUI[] = [];

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

    // Get related promises with priority-based matching
    relatedPromises = await getRelatedPromises(currentPromise, "lv", 3);

    return (
        <PromiseDetailClient
            promise={promise}
            politician={politician}
            party={party}
            category={category}
            relatedPromises={relatedPromises}
        />
    );
};

export default PromiseDetailPage;
