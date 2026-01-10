import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createPromiseSchema, promiseFilterSchema } from "@/lib/validators";
import { auth } from "@/lib/auth";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const filterParams = {
      status: searchParams.get("status") || undefined,
      politician: searchParams.get("politician") || undefined,
      category: searchParams.get("category") || undefined,
      party: searchParams.get("party") || undefined,
      search: searchParams.get("search") || undefined,
      dateFrom: searchParams.get("dateFrom") || undefined,
      dateTo: searchParams.get("dateTo") || undefined,
      page: searchParams.get("page") || "1",
      limit: searchParams.get("limit") || "10",
    };

    const parsed = promiseFilterSchema.safeParse(filterParams);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid filter params", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { status, politician, category, party, search, dateFrom, dateTo, page, limit } = parsed.data;

    const where: Prisma.PromiseWhereInput = {};

    if (status && status !== "all") {
      where.status = status;
    }

    if (politician) {
      where.politicianId = politician;
    }

    if (category) {
      where.categoryId = category;
    }

    if (party) {
      where.politician = {
        partyId: party,
      };
    }

    if (search) {
      where.OR = [
        { text: { path: ["lv"], string_contains: search } },
        { text: { path: ["en"], string_contains: search } },
        { text: { path: ["ru"], string_contains: search } },
      ];
    }

    if (dateFrom || dateTo) {
      where.dateOfPromise = {};
      if (dateFrom) {
        where.dateOfPromise.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.dateOfPromise.lte = new Date(dateTo);
      }
    }

    const skip = (page - 1) * limit;

    const [promises, total] = await Promise.all([
      prisma.promise.findMany({
        where,
        include: {
          politician: {
            include: {
              party: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  color: true,
                },
              },
            },
          },
          category: true,
          sources: true,
        },
        orderBy: { dateOfPromise: "desc" },
        skip,
        take: limit,
      }),
      prisma.promise.count({ where }),
    ]);

    return NextResponse.json({
      data: promises,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching promises:", error);
    return NextResponse.json(
      { error: "Failed to fetch promises" },
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
    const parsed = createPromiseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { sources, evidence, dateOfPromise, explanation, ...promiseData } = parsed.data;

    const promise = await prisma.promise.create({
      data: {
        ...promiseData,
        dateOfPromise: new Date(dateOfPromise),
        explanation: explanation ? (explanation as Prisma.InputJsonValue) : Prisma.JsonNull,
        sources: sources?.length
          ? {
              create: sources.map(s => ({
                type: s.type,
                url: s.url,
                title: s.title ? (s.title as Prisma.InputJsonValue) : Prisma.JsonNull,
                description: s.description ? (s.description as Prisma.InputJsonValue) : Prisma.JsonNull,
              })),
            }
          : undefined,
        evidence: evidence?.length
          ? {
              create: evidence.map(e => ({
                type: e.type,
                url: e.url,
                description: e.description ? (e.description as Prisma.InputJsonValue) : Prisma.JsonNull,
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

    return NextResponse.json(promise, { status: 201 });
  } catch (error) {
    console.error("Error creating promise:", error);
    return NextResponse.json(
      { error: "Failed to create promise" },
      { status: 500 }
    );
  }
}
