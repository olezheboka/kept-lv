import { getPoliticians, getParties, getPromises } from '@/lib/db';
import { PoliticiansClient } from '@/components/PoliticiansClient';

export default async function PoliticiansPage() {
    const [politicians, parties, promises] = await Promise.all([
        getPoliticians(),
        getParties(),
        getPromises(),
    ]);

    return (
        <PoliticiansClient
            politicians={politicians}
            parties={parties}
            promises={promises}
        />
    );
}
