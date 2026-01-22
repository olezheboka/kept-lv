import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updatePoliticianSchema } from "@/lib/validators";
import { auth } from "@/lib/auth";
// import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/audit";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const politician = await prisma.politician.findUnique({
      where: { id },
      include: {
        party: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
          },
        },
        promises: {
          include: {
            category: true,
            sources: true,
          },
          orderBy: { dateOfPromise: "desc" },
        },
      },
    });

    if (!politician) {
      return NextResponse.json(
        { error: "Politician not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(politician);
  } catch (error) {
    console.error("Error fetching politician:", error);
    return NextResponse.json(
      { error: "Failed to fetch politician" },
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
    const parsed = updatePoliticianSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { jobs, educationEntries, isActive, ...rest } = parsed.data;

    const politician = await prisma.politician.update({
      where: { id },
      data: {
        name: rest.name,
        slug: rest.slug,
        imageUrl: rest.imageUrl,
        role: rest.role,
        jobs: jobs ? { deleteMany: {}, create: jobs } : undefined,
        educationEntries: educationEntries ? { deleteMany: {}, create: educationEntries } : undefined,
        isActive: isActive !== undefined ? isActive : undefined,
        partyId: rest.partyId !== undefined ? (rest.partyId || null) : undefined,
      },
      include: {
        party: true,
      },
    });

    // Calculate changed fields
    const currentPolitician = await prisma.politician.findUnique({ where: { id } });
    const updatedFields: string[] = [];

    if (currentPolitician) {
      // Compare fields
      const changesToCheck = { ...rest, isActive };
      Object.entries(changesToCheck).forEach(([key, value]) => {
        if (value !== undefined) { // Check only if provided in update
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const currVal = (currentPolitician as any)[key];
          // Simple equality check, handling nulls
          if (currVal !== value && !(currVal === null && value === undefined)) {
            updatedFields.push(key);
          }
        }
      });
      // Always track if complex fields change
      if (jobs) updatedFields.push('jobs');
      if (educationEntries) updatedFields.push('educationEntries');
    } else {
      updatedFields.push(...Object.keys(parsed.data));
    }

    await logActivity("updated", "Politician", politician.id, politician.name, { updatedFields });

    return NextResponse.json(politician);
  } catch (error) {
    console.error("Error updating politician:", error);
    return NextResponse.json(
      { error: "Failed to update politician" },
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

    const deletedPolitician = await prisma.politician.delete({
      where: { id },
    });

    await logActivity("deleted", "Politician", id, deletedPolitician.name);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting politician:", error);
    return NextResponse.json(
      { error: "Failed to delete politician" },
      { status: 500 }
    );
  }
}
