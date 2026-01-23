import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
    const start = Date.now();
    try {
        // 1. Check environment variables (masking secrets)
        const dbUrl = process.env.DATABASE_URL;
        const maskedUrl = dbUrl
            ? dbUrl.replace(/:([^:@]+)@/, ":****@")
            : "UNDEFINED";

        // 2. Parsed URL details
        let host = "unknown";
        let protocol = "unknown";
        if (dbUrl) {
            try {
                // Handle postgres:// or prisma://
                const match = dbUrl.match(/^([a-z]+):\/\/([^/:]+)/);
                if (match) {
                    protocol = match[1];
                    host = match[2];
                }
            } catch (e) {
                // ignore parsing error
            }
        }

        // 3. Attempt simple query
        const userCount = await prisma.user.count();

        // 4. Attempt simple read
        const testCategory = await prisma.category.findFirst({ select: { slug: true } });

        // 5. Schema Consistency Check (Critical)
        // Try to fetch a relation that was recently added/modified
        let schemaCheck = "ok";
        let evidenceCheck = "ok";
        let configCheck = "ok";

        try {
            await prisma.politician.findFirst({
                include: { jobs: true } // This table 'politician_jobs' must exist
            });
        } catch (e) {
            schemaCheck = `FAILED (jobs): ${e instanceof Error ? e.message : String(e)}`;
        }

        try {
            // Check Evidence table (used in detail pages)
            await prisma.evidence.findFirst();
        } catch (e) {
            evidenceCheck = `FAILED (evidence): ${e instanceof Error ? e.message : String(e)}`;
        }

        try {
            // Check SystemConfig table (used in Layout)
            await prisma.systemConfig.findFirst();
        } catch (e) {
            configCheck = `FAILED (systemConfig): ${e instanceof Error ? e.message : String(e)}`;
        }

        const duration = Date.now() - start;

        return NextResponse.json({
            status: schemaCheck === "ok" ? "ok" : "schema-mismatch",
            duration: `${duration}ms`,
            env: {
                DATABASE_URL_CONFIG: maskedUrl,
                protocol,
                host,
                NODE_ENV: process.env.NODE_ENV,
            },
            results: {
                userCount,
                categoryFound: !!testCategory,
                schemaCheck,
                evidenceCheck,
                configCheck,
            },
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            prismaVersion: require('@prisma/client/package.json').version,
        });

    } catch (error) {
        const duration = Date.now() - start;
        return NextResponse.json({
            status: "error",
            duration: `${duration}ms`,
            error: error instanceof Error ? error.message : String(error),
            type: error instanceof Error ? error.constructor.name : typeof error,
            stack: error instanceof Error ? error.stack : undefined,
            env_check: {
                has_db_url: !!process.env.DATABASE_URL
            }
        }, { status: 500 });
    }
}
