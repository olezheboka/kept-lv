import { NextResponse } from "next/server";
import { prisma, withRetry } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const page = Number(searchParams.get("page")) || 1;
        const limit = Number(searchParams.get("limit")) || 20;
        const skip = (page - 1) * limit;

        const [activities, total] = await withRetry(() => Promise.all([
            prisma.auditLog.findMany({
                orderBy: { createdAt: "desc" },
                take: limit,
                skip: skip,
            }),
            prisma.auditLog.count(),
        ]));

        return NextResponse.json({
            activities,
            total,
            page,
            pageSize: limit,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error("Failed to fetch activities:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
