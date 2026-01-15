import { prisma } from "@/lib/prisma";
import { DashboardStats } from "@/components/admin/dashboard/DashboardStats";
import { StatusBreakdown } from "@/components/admin/dashboard/StatusBreakdown";
import { RecentActivity } from "@/components/admin/dashboard/RecentActivity";
import { PageHeader } from "@/components/admin/PageHeader";

export const dynamic = "force-dynamic";

async function getDashboardStats() {
  const [
    totalPromises,
    keptPromises,
    notKeptPromises,
    inProgressPromises,
    totalPoliticians,
    totalParties,
    totalCategories,
    recentPromises,
  ] = await Promise.all([
    prisma.promise.count(),
    prisma.promise.count({ where: { status: "KEPT" } }),
    prisma.promise.count({ where: { status: "NOT_KEPT" } }),
    prisma.promise.count({ where: { status: "IN_PROGRESS" } }),
    prisma.politician.count(),
    prisma.party.count(),
    prisma.category.count(),
    prisma.promise.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        politician: { select: { name: true, party: { select: { name: true } } } },
        category: { select: { name: true } },
      },
    }),
  ]);

  const keptRate = totalPromises > 0
    ? Math.round((keptPromises / totalPromises) * 100)
    : 0;

  return {
    totalPromises,
    keptPromises,
    notKeptPromises,
    inProgressPromises,
    totalPoliticians,
    totalParties,
    totalCategories,
    keptRate,
    recentPromises,
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
        breadcrumbs={[]}
      />

      {/* Stats Grid */}
      <DashboardStats stats={stats} />

      {/* Main Content Grid: Charts & Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-full">
        {/* Chart Section */}
        <StatusBreakdown stats={stats} />

        {/* Recent Activity */}
        <RecentActivity promises={stats.recentPromises} />
      </div>
    </div>
  );
}
