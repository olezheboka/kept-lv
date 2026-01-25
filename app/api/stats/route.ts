import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [
      totalPromises,
      keptPromises,
      notKeptPromises,
      pendingPromises,
      cancelledPromises,
      partialPromises,
      totalPoliticians,
      totalParties,
      totalCategories,
    ] = await Promise.all([
      prisma.promise.count(),
      prisma.promise.count({ where: { status: "KEPT" } }),
      prisma.promise.count({ where: { status: "NOT_KEPT" } }),
      prisma.promise.count({ where: { status: "PENDING" } }),
      prisma.promise.count({ where: { status: "CANCELLED" } }),
      prisma.promise.count({ where: { status: "PARTIAL" } }),
      prisma.politician.count(),
      prisma.party.count(),
      prisma.category.count(),
    ]);

    const keptRate = totalPromises > 0
      ? Math.round((keptPromises / totalPromises) * 100)
      : 0;

    return NextResponse.json({
      promises: {
        total: totalPromises,
        kept: keptPromises,
        notKept: notKeptPromises,
        pending: pendingPromises,
        cancelled: cancelledPromises,
        partial: partialPromises,
      },
      politicians: totalPoliticians,
      parties: totalParties,
      categories: totalCategories,
      keptRate,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
