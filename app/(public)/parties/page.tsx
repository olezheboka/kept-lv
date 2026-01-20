import { Suspense } from 'react';
import { getParties, getPromises } from '@/lib/db';
import { PartiesClient } from '@/components/PartiesClient';

export const dynamic = 'force-dynamic';

export default async function PartiesPage() {
    const [parties, promises] = await Promise.all([
        getParties(),
        getPromises(),
    ]);

    return (
        <Suspense fallback={<div className="container-wide py-8">Ielādē...</div>}>
            <PartiesClient
                parties={parties}
                promises={promises}
            />
        </Suspense>
    );
}
