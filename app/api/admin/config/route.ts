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
        const { siteName, title, description } = body;

        // Upsert each config key
        await prisma.$transaction([
            // @ts-ignore
            prisma.systemConfig.upsert({
                where: { key: "siteName" },
                update: { value: siteName },
                create: { key: "siteName", value: siteName },
            }),
            // @ts-ignore
            prisma.systemConfig.upsert({
                where: { key: "title" },
                update: { value: title },
                create: { key: "title", value: title },
            }),
            // @ts-ignore
            prisma.systemConfig.upsert({
                where: { key: "description" },
                update: { value: description },
                create: { key: "description", value: description },
            }),
        ]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Config save error:", error);
        return NextResponse.json({ error: "Failed to save config" }, { status: 500 });
    }
}
