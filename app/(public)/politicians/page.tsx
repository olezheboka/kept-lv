import { Suspense } from 'react';
import { getPoliticians, getParties, getPromises } from '@/lib/db';
import { PoliticiansClient } from '@/components/PoliticiansClient';

export default async function PoliticiansPage() {
    const [politicians, parties, promises] = await Promise.all([
        getPoliticians(),
        getParties(),
        getPromises(),
    ]);

    return (
        <Suspense fallback={<div className="container-wide py-8">Ielādē...</div>}>
            <PoliticiansClient
                politicians={politicians}
                parties={parties}
                promises={promises}
            />
        </Suspense>
    );
}
