import { prisma } from "@/lib/prisma";
import { TotalPromisesCard, TotalPoliticiansCard, TotalPartiesCard, TotalCategoriesCard } from "@/components/admin/dashboard/DashboardStats";
import { StatusBreakdown } from "@/components/admin/dashboard/StatusBreakdown";
import { RecentActivity } from "@/components/admin/dashboard/RecentActivity";
import { PageHeader } from "@/components/admin/PageHeader";

export const dynamic = "force-dynamic";

async function getDashboardStats() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    totalPromises,
    keptPromises,
    partialPromises,
    inProgressPromises,
    notKeptPromises,
    notRatedPromises,
    totalPoliticians,
    totalParties,
    totalCategories,
    recentPromises,
    topPoliticians,
    topCategories,
    allParties,
  ] = await Promise.all([
    prisma.promise.count(),
    prisma.promise.count({ where: { status: "KEPT" } }),
    prisma.promise.count({ where: { status: "PARTIAL" } }),
    prisma.promise.count({ where: { status: "IN_PROGRESS" } }),
    prisma.promise.count({ where: { status: "NOT_KEPT" } }),
    prisma.promise.count({ where: { status: "NOT_RATED" } }),
    prisma.politician.count(),
    prisma.party.count(),
    prisma.category.count(),
    prisma.promise.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        category: { select: { slug: true } },
        politician: { select: { name: true } },
        party: { select: { name: true } },
        coalitionParties: { select: { name: true } },
      },
    }),
    // Top 3 politicians by promise count
    // Top 3 politicians by promise count
    prisma.politician.findMany({
      take: 3,
      select: {
        id: true,
        name: true,
        slug: true,
        _count: { select: { promises: true } }
      },
      orderBy: { promises: { _count: 'desc' } }
    }),
    // Top 3 categories by promise count
    prisma.category.findMany({
      take: 3,
      select: {
        id: true,
        name: true,
        slug: true,
        _count: { select: { promises: true } }
      },
      orderBy: { promises: { _count: 'desc' } }
    }),
    // All parties for sorting
    prisma.party.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        politicians: {
          select: { _count: { select: { promises: true } } }
        }
      }
    }),
  ]);

  const keptRate = totalPromises > 0
    ? Math.round((keptPromises / totalPromises) * 100)
    : 0;

  // Process top parties
  const topParties = allParties
    .map(party => ({
      name: party.name,
      slug: party.slug,
      count: party.politicians.reduce((acc, curr) => acc + curr._count.promises, 0)
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  return {
    totalPromises,
    keptPromises,
    partialPromises,
    inProgressPromises,
    notKeptPromises,
    notRatedPromises,
    totalPoliticians,
    totalParties,
    totalCategories,
    keptRate,
    recentPromises,
    topPoliticians: topPoliticians.map(p => ({ name: p.name, slug: p.slug, count: p._count.promises })),
    topCategories: topCategories.map(c => ({ name: c.name, slug: c.slug, count: c._count.promises })),
    topParties,
  };
}

export default async function AdminDashboard() {
  let stats;
  try {
    stats = await getDashboardStats();
  } catch (error) {
    console.error("Dashboard error:", error);
    return (
      <div className="p-8 text-center text-red-500 bg-red-50 rounded-lg border border-red-200">
        <h2 className="text-xl font-bold mb-2">Dashboard Error</h2>
        <p className="font-mono text-sm max-w-2xl mx-auto opacity-75">
          {error instanceof Error ? error.message : "Unknown error"}
        </p>
      </div>
    );
  }

  return (
    <div className="fade-enter space-y-6">
      <PageHeader
        title="Dashboard"
        description="Overview of your promise tracking platform"
        breadcrumbs={[{ label: "Dashboard" }]}
      />

      {/* Row 1: Total Promises (50%) + Status Breakdown (50%) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TotalPromisesCard stats={stats} />
        <StatusBreakdown stats={stats} />
      </div>

      {/* Row 2: Politicians, Parties, Categories (equal width) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <TotalPoliticiansCard stats={stats} />
        <TotalPartiesCard stats={stats} />
        <TotalCategoriesCard stats={stats} />
      </div>

      {/* Row 3: Recent Activity (full width) */}
      <div>
        <RecentActivity />
      </div>
    </div>
  );
}
