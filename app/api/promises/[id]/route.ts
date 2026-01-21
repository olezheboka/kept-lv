import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updatePromiseSchema } from "@/lib/validators";
import { auth } from "@/lib/auth";

import { logActivity } from "@/lib/audit";

type RouteParams = { params: Promise<{ id: string }> };

// const LOCALES = ["lv", "en", "ru"];

import { revalidatePromise } from "@/lib/revalidate";

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const promise = await prisma.promise.findUnique({
      where: { id },
      include: {
        politician: {
          include: {
            party: {
              select: {
                id: true,
                name: true,
                slug: true,
                logoUrl: true,
              },
            },
          },
        },
        category: true,
        sources: true,
        evidence: true,
      },
    });

    if (!promise) {
      return NextResponse.json({ error: "Promise not found" }, { status: 404 });
    }

    return NextResponse.json(promise);
  } catch (error) {
    console.error("Error fetching promise:", error);
    return NextResponse.json(
      { error: "Failed to fetch promise" },
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
    const parsed = updatePromiseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.issues },
        { status: 400 }
      );
    }

    // 1. Fetch current state BEFORE update for diffing
    const currentPromise = await prisma.promise.findUnique({
      where: { id },
      include: { sources: true, evidence: true }
    });

    if (!currentPromise) {
      return NextResponse.json({ error: "Promise not found" }, { status: 404 });
    }

    const { sources, evidence, dateOfPromise, coalitionPartyIds, ...promiseData } = parsed.data;

    // 2. Perform updates
    // Delete existing sources and evidence if new ones are provided
    if (sources) {
      await prisma.source.deleteMany({ where: { promiseId: id } });
    }
    if (evidence) {
      await prisma.evidence.deleteMany({ where: { promiseId: id } });
    }

    const promise = await prisma.promise.update({
      where: { id },
      data: {
        ...promiseData,
        tags: promiseData.tags,
        dateOfPromise: dateOfPromise ? new Date(dateOfPromise) : undefined,
        // Update coalition parties if provided (using set to replace)
        coalitionParties: coalitionPartyIds
          ? { set: coalitionPartyIds.map(id => ({ id })) }
          : undefined,
        sources: sources?.length
          ? {
            create: sources.map(s => ({
              type: s.type,
              url: s.url,
              title: s.title,
              description: s.description,
            })),
          }
          : undefined,
        evidence: evidence?.length
          ? {
            create: evidence.map(e => ({
              type: e.type,
              url: e.url,
              description: e.description,
            })),
          }
          : undefined,
      },
      include: {
        politician: {
          include: {
            party: true,
          },
        },
        party: true,
        coalitionParties: true,
        category: true,
        sources: true,
        evidence: true,
      },
    });

    // 3. Calculate changed fields using pre-update state
    const updatedFields: string[] = [];

    // Compare primitive fields
    Object.entries(promiseData).forEach(([key, value]) => {
      const k = key as keyof typeof promiseData;
      // Use loose equality or JSON stringify for simple array comparisons (tags)
      if (JSON.stringify(currentPromise[k as keyof typeof currentPromise]) !== JSON.stringify(value)) {
        updatedFields.push(key);
      }
    });

    // Compare dates
    if (dateOfPromise && currentPromise.dateOfPromise.toISOString() !== new Date(dateOfPromise).toISOString()) {
      updatedFields.push("dateOfPromise");
    }

    // Deep compare sources
    if (sources) {
      const oldSources = currentPromise.sources.map(s => ({ url: s.url, title: s.title, description: s.description }));
      const newSources = sources.map(s => ({ url: s.url, title: s.title, description: s.description }));
      if (JSON.stringify(oldSources) !== JSON.stringify(newSources)) {
        updatedFields.push("sources");
      }
    }

    // Deep compare evidence
    if (evidence) {
      const oldEvidence = currentPromise.evidence.map(e => ({ url: e.url, description: e.description }));
      const newEvidence = evidence.map(e => ({ url: e.url, description: e.description }));
      if (JSON.stringify(oldEvidence) !== JSON.stringify(newEvidence)) {
        updatedFields.push("evidence");
      }
    }

    await logActivity("updated", "Promise", promise.id, promise.title, {
      status: promise.status,
      updatedFields
    });

    revalidatePromise(promise);

    return NextResponse.json(promise);
  } catch (error) {
    console.error("Error updating promise:", error);
    return NextResponse.json(
      { error: "Failed to update promise" },
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

    const deletedPromise = await prisma.promise.delete({
      where: { id },
      include: {
        politician: { include: { party: true } },
        party: true,
        category: true,
      }
    });

    await logActivity("deleted", "Promise", id, deletedPromise.title);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    revalidatePromise({ ...deletedPromise, coalitionParties: [] } as any); // Partial match for types, or better, include all relations needed.
    // revalidate.ts expects PromiseWithRelations.
    // Let's include all relations in delete as well.

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting promise:", error);
    return NextResponse.json(
      { error: "Failed to delete promise" },
      { status: 500 }
    );
  }
}
