import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updatePartySchema } from "@/lib/validators";
import { auth } from "@/lib/auth";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const party = await prisma.party.findUnique({
      where: { id },
      include: {
        politicians: {
          select: {
            id: true,
            name: true,
            slug: true,
            imageUrl: true,
          },
        },
      },
    });

    if (!party) {
      return NextResponse.json({ error: "Party not found" }, { status: 404 });
    }

    return NextResponse.json(party);
  } catch (error) {
    console.error("Error fetching party:", error);
    return NextResponse.json(
      { error: "Failed to fetch party" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = updatePartySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const party = await prisma.party.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json(party);
  } catch (error) {
    console.error("Error updating party:", error);
    return NextResponse.json(
      { error: "Failed to update party" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await prisma.party.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting party:", error);
    return NextResponse.json(
      { error: "Failed to delete party" },
      { status: 500 }
    );
  }
}
