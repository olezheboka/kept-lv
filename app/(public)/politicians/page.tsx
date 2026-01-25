import { Suspense } from 'react';
import { getPoliticians, getParties, getPromises } from '@/lib/db';
import { PoliticiansClient } from '@/components/PoliticiansClient';

// export const revalidate = 60;
export const dynamic = 'force-dynamic';

export default async function PoliticiansPage() {
    const [politicians, parties] = await Promise.all([
        getPoliticians(),
        getParties(),
    ]);

    return (
        <PoliticiansClient
            politicians={politicians}
            parties={parties}
        />
    );
}
