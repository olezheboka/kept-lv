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

    const { sources, evidence, dateOfPromise, statusUpdatedAt, coalitionPartyIds, ...promiseData } = parsed.data;

    console.log("DEBUG PUT payload:", {
      status: promiseData.status,
      statusUpdatedAtRaw: statusUpdatedAt,
      statusUpdatedAtDate: statusUpdatedAt ? new Date(statusUpdatedAt) : "N/A"
    });

    // Check for status change
    const statusChanged = promiseData.status && promiseData.status !== currentPromise.status;

    // 2. Perform updates in a transaction to prevent data loss on failure
    const promise = await prisma.$transaction(async (tx) => {
      // Delete existing sources and evidence if new ones are provided
      // Note: We MUST check if they are provided (array present) before deleting
      if (sources) {
        await tx.source.deleteMany({ where: { promiseId: id } });
      }
      if (evidence) {
        await tx.evidence.deleteMany({ where: { promiseId: id } });
      }

      return await tx.promise.update({
        where: { id },
        data: {
          ...promiseData,
          tags: promiseData.tags,
          dateOfPromise: dateOfPromise ? new Date(dateOfPromise) : undefined,
          statusUpdatedAt: statusUpdatedAt ? new Date(statusUpdatedAt) : undefined,
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
          statusHistory: statusChanged
            ? {
              create: {
                oldStatus: currentPromise.status,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                newStatus: promiseData.status as any,
                changedBy: session.user?.email || "Unknown",
                changedAt: statusUpdatedAt ? new Date(statusUpdatedAt) : new Date(),
                note: `Status changed from ${currentPromise.status} to ${promiseData.status}`
              }
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
      const oldSources = currentPromise.sources.map(s => ({
        type: s.type,
        url: s.url,
        title: s.title || null,
        description: s.description || null
      }));
      const newSources = sources.map(s => ({
        type: s.type,
        url: s.url,
        title: s.title || null,
        description: s.description || null
      }));

      // Sort by URL to ensure order doesn't affect comparison (optional but good practice)
      const sortFn = (a: { url: string }, b: { url: string }) => a.url.localeCompare(b.url);
      oldSources.sort(sortFn);
      newSources.sort(sortFn);

      if (JSON.stringify(oldSources) !== JSON.stringify(newSources)) {
        updatedFields.push("sources");
      }
    }

    // Deep compare evidence
    if (evidence) {
      const oldEvidence = currentPromise.evidence.map(e => ({
        type: e.type,
        url: e.url,
        description: e.description || null
      }));
      const newEvidence = evidence.map(e => ({
        type: e.type,
        url: e.url,
        description: e.description || null
      }));

      const sortFn = (a: { url: string }, b: { url: string }) => a.url.localeCompare(b.url);
      oldEvidence.sort(sortFn);
      newEvidence.sort(sortFn);

      if (JSON.stringify(oldEvidence) !== JSON.stringify(newEvidence)) {
        updatedFields.push("evidence");
      }
    }

    await logActivity("updated", "Promise", promise.id, promise.title, {
      status: promise.status,
      updatedFields
    });

    // If statusUpdatedAt is present and status didn't change, check if we need to sync the history date.
    if (!statusChanged && statusUpdatedAt) {
      // Find the latest history entry
      const latestHistory = await prisma.promiseStatusHistory.findFirst({
        where: { promiseId: id },
        orderBy: { changedAt: 'desc' }
      });

      if (latestHistory) {
        const newDate = new Date(statusUpdatedAt);
        // Update if the timestamps differ more than 1000ms (to avoid floating point/precision issues)
        if (Math.abs(latestHistory.changedAt.getTime() - newDate.getTime()) > 1000) {
          console.log("Syncing latest history entry date to:", statusUpdatedAt);
          await prisma.promiseStatusHistory.update({
            where: { id: latestHistory.id },
            data: { changedAt: newDate }
          });
        }
      }
    }

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

    // Removed revalidatePromise calls to prevent build errors
    // revalidatePromise({ ...deletedPromise, coalitionParties: [] } as any);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting promise:", error);
    return NextResponse.json(
      { error: "Failed to delete promise" },
      { status: 500 }
    );
  }
}
