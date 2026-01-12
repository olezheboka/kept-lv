import { getParties, getPoliticians, getPromises } from '@/lib/db';
import { PartiesClient } from '@/components/PartiesClient';

export const dynamic = 'force-dynamic';

export default async function PartiesPage() {
    const [parties, politicians, promises] = await Promise.all([
        getParties("lv"),
        getPoliticians("lv"),
        getPromises("lv"),
    ]);

    return (
        <PartiesClient
            parties={parties}
            politicians={politicians}
            promises={promises}
        />
    );
}
