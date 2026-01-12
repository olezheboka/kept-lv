import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updatePromiseSchema } from "@/lib/validators";
import { auth } from "@/lib/auth";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

type RouteParams = { params: Promise<{ id: string }> };

const LOCALES = ["lv", "en", "ru"];

function revalidatePromisePaths(promiseId: string) {
  revalidatePath("/promises");
  revalidatePath(`/promises/${promiseId}`);
  revalidatePath("/");
}

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
                color: true,
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

    const { sources, evidence, dateOfPromise, ...promiseData } = parsed.data;

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
        dateOfPromise: dateOfPromise ? new Date(dateOfPromise) : undefined,
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
        category: true,
        sources: true,
        evidence: true,
      },
    });

    revalidatePromisePaths(id);

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

    await prisma.promise.delete({
      where: { id },
    });

    revalidatePromisePaths(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting promise:", error);
    return NextResponse.json(
      { error: "Failed to delete promise" },
      { status: 500 }
    );
  }
}
