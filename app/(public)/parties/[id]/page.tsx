
import {
    getPartyBySlug,
    getPromisesByParty
} from '@/lib/db';
import { PartyDetailClient } from '@/components/PartyDetailClient';

interface PageProps {
    params: Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';

const PartyDetailPage = async ({ params }: PageProps) => {
    const { id } = await params;
    const party = await getPartyBySlug(id);

    if (!party) {
        return <PartyDetailClient party={null} promises={[]} />;
    }

    const promises = await getPromisesByParty(party.slug);

    return (
        <PartyDetailClient
            party={party}
            promises={promises}
        />
    );
};

export default PartyDetailPage;
