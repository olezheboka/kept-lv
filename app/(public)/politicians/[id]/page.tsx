

import { getPoliticianBySlug, getPartyBySlug, getPromisesByPolitician } from '@/lib/db';
import { PoliticianDetailClient } from '@/components/PoliticianDetailClient';

interface PageProps {
    params: Promise<{ id: string }>;
}

import { notFound } from 'next/navigation';

// export const revalidate = 60;
export const dynamic = 'force-dynamic';

const PoliticianDetailPage = async ({ params }: PageProps) => {
    const { id } = await params;
    const politician = await getPoliticianBySlug(id);

    if (!politician) {
        notFound();
    }

    // politician.partyId is slug
    const party = politician.partyId ? await getPartyBySlug(politician.partyId) : null;
    const promises = await getPromisesByPolitician(politician.id); // Wait, getPromisesByPolitician takes SLUG or ID?
    // In db.ts: function getPromisesByPolitician(politicianSlug: string, ...) requires slug.
    // politician.id IS slug in PoliticianUI (db.ts line 210: id: pol.slug).
    // But verify.
    // In db.ts:
    // export interface PoliticianUI { id: string; slug: string; ... }
    // getPoliticians maps id: pol.slug.
    // So politician.id is slug.
    // And getPromisesByPolitician takes "politicianSlug".
    // So use politician.slug or politician.id (they are same).

    return (
        <PoliticianDetailClient
            politician={politician}
            party={party}
            promises={promises}
        />
    );
};

export default PoliticianDetailPage;
