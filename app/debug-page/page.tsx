import { prisma } from "@/lib/prisma";
import { getParties, getPromises } from "@/lib/db";
import { PartiesClient } from "@/components/PartiesClient";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const dynamic = 'force-dynamic';

export default async function DebugPage() {
    const start = Date.now();

    // Try a DB call in the page component
    let dbStatus = "ok";
    let count = 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let parties: any[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let promises: any[] = [];
    let errorDetail = "";

    try {
        count = await prisma.user.count();

        // Testing lib/db.ts functions in RSC context
        parties = await getParties();
        promises = await getPromises();

    } catch (e) {
        dbStatus = "FAILED";
        errorDetail = e instanceof Error ? e.message : String(e);
        console.error("Debug Page Error:", e);
    }

    if (errorDetail) {
        return (
            <div className="p-8 font-mono text-red-600">
                <h1 className="text-2xl font-bold">Debug Failed (Data Fetching)</h1>
                <pre>{errorDetail}</pre>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Header />

            <div className="p-4 bg-yellow-100 dark:bg-yellow-900 border-b">
                <h1 className="font-bold">Debug Page with Header/Footer</h1>
                <p className="text-sm">
                    If this page crashes, the issue is in the Header or Footer.
                    If it prompts for auth/cookies, it might be Header login logic.
                </p>
            </div>

            <main className="flex-1">
                <PartiesClient parties={parties} promises={promises} />
            </main>

            <Footer />
        </div>
    );
}
