import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const query = searchParams.get("q");

        if (!query || query.length < 2) {
            return NextResponse.json({
                promises: [],
                politicians: [],
                parties: [],
                categories: []
            });
        }

        const [promises, politicians, parties, categories] = await Promise.all([
            prisma.promise.findMany({
                where: {
                    title: {
                        contains: query,
                        mode: 'insensitive'
                    }
                },
                take: 5,
                select: { id: true, title: true }
            }),
            prisma.politician.findMany({
                where: {
                    name: {
                        contains: query,
                        mode: 'insensitive'
                    }
                },
                take: 5,
                select: { id: true, name: true }
            }),
            prisma.party.findMany({
                where: {
                    name: {
                        contains: query,
                        mode: 'insensitive'
                    }
                },
                take: 5,
                select: { id: true, name: true }
            }),
            prisma.category.findMany({
                where: {
                    name: {
                        contains: query,
                        mode: 'insensitive'
                    }
                },
                take: 5,
                select: { id: true, name: true }
            })
        ]);

        return NextResponse.json({
            promises,
            politicians,
            parties,
            categories
        });
    } catch (error) {
        console.error("Search error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
