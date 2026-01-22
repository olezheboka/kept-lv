import { Suspense } from 'react';
import { getPromises, getParties } from '@/lib/db';
import { PromisesClient } from '@/components/PromisesClient';

// export const revalidate = 60;
export const dynamic = 'force-dynamic';

export default async function PromisesPage() {
    const [promises, parties] = await Promise.all([
        getPromises(),
        getParties(),
    ]);

    return (
        <PromisesClient initialPromises={promises} parties={parties} />
    );
}
