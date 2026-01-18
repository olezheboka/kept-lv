import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/audit";
// import { revalidatePath } from "next/cache";

export async function GET() {
    try {
        const configs = await prisma.systemConfig.findMany();
        const configMap = configs.reduce((acc: Record<string, string>, curr: { key: string; value: string }) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {} as Record<string, string>);

        return NextResponse.json(configMap);
    } catch {
        return NextResponse.json({ error: "Failed to fetch config" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // 1. Fetch current config to compare
        const currentConfigs = await prisma.systemConfig.findMany();
        const currentConfigMap = currentConfigs.reduce((acc: Record<string, string>, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {} as Record<string, string>);

        // 2. Identify changed fields
        const changedKeys: string[] = [];
        const updates: any[] = [];

        Object.entries(body).forEach(([key, value]) => {
            const stringValue = String(value || "");
            const currentValue = currentConfigMap[key] || "";

            if (stringValue !== currentValue) {
                changedKeys.push(key);
                updates.push(
                    prisma.systemConfig.upsert({
                        where: { key },
                        update: { value: stringValue },
                        create: { key, value: stringValue },
                    })
                );
            }
        });

        // 3. If no changes, return early
        if (changedKeys.length === 0) {
            return NextResponse.json({ success: true, message: "No changes detected" });
        }

        // 4. Apply updates
        await prisma.$transaction(updates);

        // 5. Log activity (wrapped in try/catch so it doesn't fail the request)
        try {
            await logActivity(
                "configuration_changed",
                "SystemConfig",
                null,
                "System Configuration",
                { updatedFields: changedKeys }
            );
        } catch (logError) {
            console.error("Failed to log activity:", logError);
            // Don't fail the request if logging fails
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Config save error:", error);
        return NextResponse.json({ error: "Failed to save config" }, { status: 500 });
    }
}
