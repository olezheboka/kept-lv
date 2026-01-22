import { prisma } from "@/lib/prisma";
import { getParties, getPromises } from "@/lib/db";

export const dynamic = 'force-dynamic';

export default async function DebugPage() {
    const start = Date.now();

    // Try a DB call in the page component
    let dbStatus = "ok";
    let count = 0;
    let partiesCount = 0;
    let promisesCount = 0;
    let errorDetail = "";

    try {
        count = await prisma.user.count();

        // Testing lib/db.ts functions in RSC context
        const parties = await getParties();
        partiesCount = parties.length;

        const promises = await getPromises();
        promisesCount = promises.length;

    } catch (e) {
        dbStatus = "FAILED";
        errorDetail = e instanceof Error ? e.message : String(e);
        console.error("Debug Page Error:", e);
    }

    return (
        <div className="p-8 font-mono">
            <h1 className="text-2xl font-bold mb-4">Debug Page (Server Component)</h1>
            <div className="space-y-4">
                <div className="space-y-1">
                    <p>Render Time: {new Date().toISOString()}</p>
                    <p>Duration: {Date.now() - start}ms</p>
                </div>

                <div className="space-y-1">
                    <p className={dbStatus === "ok" ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                        Overall Status: {dbStatus}
                    </p>
                </div>

                <div className="border p-4 rounded bg-gray-50 dark:bg-gray-900 space-y-2">
                    <p>User Count (Direct Prisma): {count}</p>
                    <p>Parties (getParties): {partiesCount}</p>
                    <p>Promises (getPromises): {promisesCount}</p>
                </div>

                {errorDetail && (
                    <div className="p-4 bg-red-100 text-red-800 rounded border border-red-300 overflow-auto">
                        <p className="font-bold underline mb-2">Error Trace:</p>
                        <pre className="text-sm whitespace-pre-wrap">{errorDetail}</pre>
                    </div>
                )}
            </div>
        </div>
    );
}
