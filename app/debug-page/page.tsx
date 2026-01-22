import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export default async function DebugPage() {
    const start = Date.now();

    // Try a DB call in the page component
    let dbStatus = "ok";
    let count = 0;
    try {
        count = await prisma.user.count();
    } catch (e) {
        dbStatus = e instanceof Error ? e.message : String(e);
    }

    return (
        <div className="p-8 font-mono">
            <h1 className="text-2xl font-bold mb-4">Debug Page (Server Component)</h1>
            <div className="space-y-2">
                <p>Render Time: {new Date().toISOString()}</p>
                <p>Duration: {Date.now() - start}ms</p>
                <p>DB Status: {dbStatus}</p>
                <p>User Count: {count}</p>
            </div>
        </div>
    );
}
