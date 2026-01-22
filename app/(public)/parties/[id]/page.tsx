
import {
    getPartyBySlug,
    getPromisesByParty
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
    try {
        const party = await getPartyBySlug(id);

        if (!party) {
            notFound();
        }

        const promises = await getPromisesByParty(party.id);

        return (
            <PartyDetailClient
                party={party}
                promises={promises}
            />
        );
    } catch (error) {
        console.error(`Error loading party ${id}:`, error);
        throw error;
    }


};

export default PartyDetailPage;
