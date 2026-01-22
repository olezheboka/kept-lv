import { NextResponse } from "next/server";
import { getParties, getPoliticians, getCategories } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
    const start = Date.now();
    const report: Record<string, unknown> = {};

    try {
        // Test 1: Parties
        const t1 = Date.now();
        try {
            const parties = await getParties("lv");
            report.parties = { status: "ok", count: parties.length, duration: `${Date.now() - t1}ms` };
        } catch (e) {
            report.parties = { status: "failed", error: e instanceof Error ? e.message : String(e), duration: `${Date.now() - t1}ms` };
        }

        // Test 2: Categories
        const t2 = Date.now();
        try {
            const categories = await getCategories("lv");
            report.categories = { status: "ok", count: categories.length, duration: `${Date.now() - t2}ms` };
        } catch (e) {
            report.categories = { status: "failed", error: e instanceof Error ? e.message : String(e), duration: `${Date.now() - t2}ms` };
        }

        // Test 3: Politicians (Heavier query)
        const t3 = Date.now();
        try {
            const politicians = await getPoliticians("lv");
            report.politicians = { status: "ok", count: politicians.length, duration: `${Date.now() - t3}ms` };
        } catch (e) {
            report.politicians = { status: "failed", error: e instanceof Error ? e.message : String(e), duration: `${Date.now() - t3}ms` };
        }

        // Test 4: Promises (The likeliest suspect)
        const t4 = Date.now();
        try {
            const { getPromises } = await import("@/lib/db");
            const promises = await getPromises("lv");
            report.promises = { status: "ok", count: promises.length, duration: `${Date.now() - t4}ms` };
        } catch (e) {
            report.promises = { status: "failed", error: e instanceof Error ? e.message : String(e), duration: `${Date.now() - t4}ms` };
        }

        // Test 5: Detail Page Simulation (Politician)
        // Pick one politician and try to load their full profile + promises
        const t5 = Date.now();
        try {
            const { getPoliticians, getPoliticianBySlug, getPromisesByPolitician } = await import("@/lib/db");
            const allPol = await getPoliticians("lv");

            if (allPol.length > 0) {
                const targetSlug = allPol[0].slug;
                const detail = await getPoliticianBySlug(targetSlug);
                const polPromises = await getPromisesByPolitician(targetSlug);

                report.detailSimulation = {
                    status: "ok",
                    target: targetSlug,
                    detailFound: !!detail,
                    promisesCount: polPromises.length,
                    duration: `${Date.now() - t5}ms`
                };
            } else {
                report.detailSimulation = { status: "skipped", reason: "no politicians found" };
            }

        } catch (e) {
            report.detailSimulation = { status: "failed", error: e instanceof Error ? e.message : String(e), duration: `${Date.now() - t5}ms` };
        }

        const totalDuration = Date.now() - start;

        return NextResponse.json({
            status: "completed",
            totalDuration: `${totalDuration}ms`,
            report
        });

    } catch (globalError) {
        return NextResponse.json({
            status: "crash",
            error: globalError instanceof Error ? globalError.message : String(globalError)
        }, { status: 500 });
    }
}
