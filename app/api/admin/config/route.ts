import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function GET() {
    try {
        // @ts-ignore
        const configs = await prisma.systemConfig.findMany();
        const configMap = configs.reduce((acc: Record<string, string>, curr: { key: string; value: string }) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {} as Record<string, string>);

        return NextResponse.json(configMap);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch config" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Dynamic upsert for all provided keys
        const updates = Object.entries(body).map(([key, value]) => {
            // @ts-ignore
            return prisma.systemConfig.upsert({
                where: { key },
                update: { value: String(value || "") },
                create: { key, value: String(value || "") },
            });
        });

        await prisma.$transaction(updates);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Config save error:", error);
        return NextResponse.json({ error: "Failed to save config" }, { status: 500 });
    }
}
