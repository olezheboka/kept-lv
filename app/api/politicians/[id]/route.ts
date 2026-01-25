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

    // 1. Fetch current state BEFORE update for diffing
    const currentPolitician = await prisma.politician.findUnique({
      where: { id },
      include: {
        jobs: true,
        educationEntries: true,
      }
    });

    if (!currentPolitician) {
      return NextResponse.json({ error: "Politician not found" }, { status: 404 });
    }

    // 2. Perform updates
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

    // 3. Calculate changed fields
    const updatedFields: string[] = [];

    // Compare primitive fields
    const changesToCheck = { ...rest, isActive };
    Object.entries(changesToCheck).forEach(([key, value]) => {
      if (value !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const currVal = (currentPolitician as any)[key];
        // Simple equality check, handling nulls vs undefined
        // If currVal is null and value is undefined/missing (shouldn't happen here due to loop, but for safety)
        if (currVal !== value && !(currVal === null && (value === undefined || value === null))) {
          updatedFields.push(key);
        }
      }
    });

    // Compare jobs
    if (jobs) {
      const oldJobs = currentPolitician.jobs.map(j => ({
        title: j.title,
        company: j.company || null,
        years: j.years
      }));
      const newJobs = jobs.map(j => ({
        title: j.title,
        company: j.company || null,
        years: j.years
      }));

      // Sort to ensure order doesn't flag change (e.g. by title + years)
      const sortFn = (a: { title: string; years: string }, b: { title: string; years: string }) =>
        (a.title + a.years).localeCompare(b.title + b.years);
      oldJobs.sort(sortFn);
      newJobs.sort(sortFn);

      if (JSON.stringify(oldJobs) !== JSON.stringify(newJobs)) {
        updatedFields.push('jobs');
      }
    }

    // Compare education
    if (educationEntries) {
      const oldEdu = currentPolitician.educationEntries.map(e => ({
        degree: e.degree,
        institution: e.institution,
        year: e.year
      }));
      const newEdu = educationEntries.map(e => ({
        degree: e.degree,
        institution: e.institution,
        year: e.year
      }));

      const sortFn = (a: { degree: string; year: string }, b: { degree: string; year: string }) =>
        (a.degree + a.year).localeCompare(b.degree + b.year);
      oldEdu.sort(sortFn);
      newEdu.sort(sortFn);

      if (JSON.stringify(oldEdu) !== JSON.stringify(newEdu)) {
        updatedFields.push('educationEntries');
      }
    }

    await logActivity("updated", "Politician", politician.id, politician.name, { updatedFields });

    return NextResponse.json(politician);
  } catch (error) {
    console.error("Error updating politician:", error);
    return NextResponse.json(
      { error: "Failed to update politician", details: error instanceof Error ? error.message : String(error) },
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
