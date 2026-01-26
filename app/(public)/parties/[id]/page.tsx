
import {
    getPartyBySlug,
    getPromisesByParty,
    getPoliticiansByPartySlug
} from '@/lib/db';
import { PartyDetailClient } from '@/components/PartyDetailClient';

interface PageProps {
    params: Promise<{ id: string }>;
}

import { notFound } from 'next/navigation';

// export const revalidate = 60;
export const dynamic = 'force-dynamic';

const PartyDetailPage = async ({ params }: PageProps) => {
    const { id } = await params;

    let party;
    let promises;
    let politicians;

    try {
        party = await getPartyBySlug(id);

        if (party) {
            promises = await getPromisesByParty(party.id);
            politicians = await getPoliticiansByPartySlug(party.id);
        }
    } catch (error) {
        console.error(`Error loading party ${id}:`, error);
        throw error;
    }

    if (!party) {
        notFound();
    }

    return (
        <PartyDetailClient
            party={party}
            promises={promises!}
            politicians={politicians!}
        />
    );
};

export default PartyDetailPage;
