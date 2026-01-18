import { getParties, getPromises } from '@/lib/db';
import { PartiesClient } from '@/components/PartiesClient';

export const dynamic = 'force-dynamic';

export default async function PartiesPage() {
    const [parties, promises] = await Promise.all([
        getParties(),
        getPromises(),
    ]);

    return (
        <PartiesClient
            parties={parties}
            promises={promises}
        />
    );
}
