import { Suspense } from 'react';
import { getParties, getPromises } from '@/lib/db';
import { PartiesClient } from '@/components/PartiesClient';

// export const revalidate = 60;
export const dynamic = 'force-dynamic';

export default async function PartiesPage() {
    const parties = await getParties();

    return (
        <PartiesClient
            parties={parties}
        />
    );
}
