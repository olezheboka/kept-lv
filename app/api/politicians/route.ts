import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createPoliticianSchema } from "@/lib/validators";
import { auth } from "@/lib/auth";
import { logActivity } from "@/lib/audit";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const partyId = searchParams.get("partyId");

    const politicians = await prisma.politician.findMany({
      where: partyId ? { partyId } : undefined,
      include: {
        party: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
          },
        },
        _count: {
          select: { promises: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(politicians);
  } catch (error) {
    console.error("Error fetching politicians:", error);
    return NextResponse.json(
      { error: "Failed to fetch politicians" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createPoliticianSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { jobs, educationEntries, isActive, ...rest } = parsed.data;


    const politician = await prisma.politician.create({
      data: {
        ...rest,
        jobs: jobs ? { create: jobs } : undefined,
        educationEntries: educationEntries ? { create: educationEntries } : undefined,
        isActive: isActive !== undefined ? isActive : true,
      },
      include: {
        party: true,
      },
    });

    await logActivity("created", "Politician", politician.id, politician.name);

    return NextResponse.json(politician, { status: 201 });
  } catch (error) {
    console.error("Error creating politician:", error);
    return NextResponse.json(
      { error: "Failed to create politician" },
      { status: 500 }
    );
  }
}
