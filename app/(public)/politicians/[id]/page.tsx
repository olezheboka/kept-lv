
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getPoliticianBySlug, getPartyBySlug, getPromisesByPolitician } from '@/lib/db';
import { PoliticianDetailClient } from '@/components/PoliticianDetailClient';

interface PageProps {
    params: Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';

const PoliticianDetailPage = async ({ params }: PageProps) => {
    const { id } = await params;
    const politician = await getPoliticianBySlug(id);

    if (!politician) {
        // Pass null or handle 404
        // PoliticianDetailClient checks for !politician
        // But it expects PoliticianUI, let's update client prop types or return early
        // Actually client component handles check, but prop type mismatch if we pass null.
        // Let's pass null and update client to accept null.
        // Or just return Not Found UI here?
        // Client component has Not Found UI.
        return (
            <div className="flex flex-col bg-background min-h-[50vh] items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-foreground mb-4">Politiķis nav atrasta</h1>
                    <Link href="/politicians">
                        <Button>Atpakaļ uz politiķiem</Button>
                    </Link>
                </div>
            </div>
        );
    }

    // politician.partyId is slug
    const party = politician.partyId ? await getPartyBySlug(politician.partyId) : null;
    const promises = await getPromisesByPolitician(politician.id); // Wait, getPromisesByPolitician takes SLUG or ID?
    // In db.ts: function getPromisesByPolitician(politicianSlug: string, ...) requires slug.
    // politician.id IS slug in PoliticianUI (db.ts line 210: id: pol.slug).
    // But verify.
    // In db.ts:
    // export interface PoliticianUI { id: string; slug: string; ... }
    // getPoliticians maps id: pol.slug.
    // So politician.id is slug.
    // And getPromisesByPolitician takes "politicianSlug".
    // So use politician.slug or politician.id (they are same).

    return (
        <PoliticianDetailClient
            politician={politician}
            party={party}
            promises={promises}
        />
    );
};

export default PoliticianDetailPage;
