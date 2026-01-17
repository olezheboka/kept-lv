import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createPartySchema } from "@/lib/validators";
import { auth } from "@/lib/auth";
import { logActivity } from "@/lib/audit";

export async function GET() {
  try {
    const parties = await prisma.party.findMany({
      include: {
        _count: {
          select: { politicians: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(parties);
  } catch (error) {
    console.error("Error fetching parties:", error);
    return NextResponse.json(
      { error: "Failed to fetch parties" },
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
    const parsed = createPartySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const party = await prisma.party.create({
      data: parsed.data,
    });

    await logActivity("created", "Party", party.id, party.name);

    return NextResponse.json(party, { status: 201 });
  } catch (error) {
    console.error("Error creating party:", error);
    return NextResponse.json(
      { error: "Failed to create party" },
      { status: 500 }
    );
  }
}
