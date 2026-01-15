import { Suspense } from 'react';
import { getPromises, getParties } from '@/lib/db';
import { PromisesClient } from '@/components/PromisesClient';

export default async function PromisesPage() {
    const [promises, parties] = await Promise.all([
        getPromises(),
        getParties(),
    ]);

    return (
        <Suspense fallback={<div className="container-wide py-8">Loading...</div>}>
            <PromisesClient initialPromises={promises} parties={parties} />
        </Suspense>
    );
}
