import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Users,
  FileText,
  Building2,
  Tag,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Plus
} from "lucide-react";

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
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        politician: { select: { name: true } },
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
  /* No translations needed */
  const stats = await getDashboardStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Overview of the Solījums.lv platform data.</p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 bg-card border border-border rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Promises</p>
              <p className="text-2xl font-bold text-foreground">{stats.totalPromises}</p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-card border border-border rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Politicians</p>
              <p className="text-2xl font-bold text-foreground">{stats.totalPoliticians}</p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-card border border-border rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-violet-50 text-violet-600 rounded-lg">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Parties</p>
              <p className="text-2xl font-bold text-foreground">{stats.totalParties}</p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-card border border-border rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Kept Rate</p>
              <p className="text-2xl font-bold text-foreground">{stats.keptRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 bg-card border border-border rounded-xl shadow-sm flex flex-col items-center text-center">
          <div className="mb-2 p-2 bg-emerald-100 text-emerald-700 rounded-full">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <p className="text-3xl font-bold text-foreground">{stats.keptPromises}</p>
          <p className="text-sm text-muted-foreground">Promises Kept</p>
        </div>
        <div className="p-6 bg-card border border-border rounded-xl shadow-sm flex flex-col items-center text-center">
          <div className="mb-2 p-2 bg-rose-100 text-rose-700 rounded-full">
            <XCircle className="w-5 h-5" />
          </div>
          <p className="text-3xl font-bold text-foreground">{stats.notKeptPromises}</p>
          <p className="text-sm text-muted-foreground">Not Kept</p>
        </div>
        <div className="p-6 bg-card border border-border rounded-xl shadow-sm flex flex-col items-center text-center">
          <div className="mb-2 p-2 bg-amber-100 text-amber-700 rounded-full">
            <Clock className="w-5 h-5" />
          </div>
          <p className="text-3xl font-bold text-foreground">{stats.inProgressPromises}</p>
          <p className="text-sm text-muted-foreground">In Progress</p>
        </div>
      </div>

      {/* Quick Actions & Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-3">
            <Link href="/admin/promises/new" className="flex items-center justify-between p-4 bg-card border border-border rounded-lg hover:border-primary/50 hover:bg-muted/50 transition-all group">
              <span className="flex items-center gap-3 font-medium text-foreground">
                <FileText className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                Add Promise
              </span>
              <Plus className="w-4 h-4 text-muted-foreground" />
            </Link>
            <Link href="/admin/politicians/new" className="flex items-center justify-between p-4 bg-card border border-border rounded-lg hover:border-primary/50 hover:bg-muted/50 transition-all group">
              <span className="flex items-center gap-3 font-medium text-foreground">
                <Users className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                Add Politician
              </span>
              <Plus className="w-4 h-4 text-muted-foreground" />
            </Link>
            <Link href="/admin/parties/new" className="flex items-center justify-between p-4 bg-card border border-border rounded-lg hover:border-primary/50 hover:bg-muted/50 transition-all group">
              <span className="flex items-center gap-3 font-medium text-foreground">
                <Building2 className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                Add Party
              </span>
              <Plus className="w-4 h-4 text-muted-foreground" />
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Recent Promises</h2>
            <Link href="/admin/promises" className="text-sm text-primary hover:underline">View All</Link>
          </div>

          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="divide-y divide-border">
              {stats.recentPromises.map((promise) => (
                <Link
                  key={promise.id}
                  href={`/admin/promises/${promise.id}`}
                  className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="min-w-0 pr-4">
                    <p className="font-medium text-foreground truncate">
                      {(promise as any).title || (promise as any).text}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {promise.politician.name} • {(promise.category.name as any)}
                    </p>
                  </div>
                  <span className={`inline-flex items-center flex-shrink-0 px-2.5 py-0.5 rounded-full text-xs font-medium border
                                ${promise.status === "KEPT" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                      promise.status === "NOT_KEPT" ? "bg-red-50 text-red-700 border-red-200" :
                        promise.status === "IN_PROGRESS" ? "bg-blue-50 text-blue-700 border-blue-200" :
                          promise.status === "PARTIAL" ? "bg-amber-50 text-amber-700 border-amber-200" :
                            "bg-gray-50 text-gray-600 border-gray-200"
                    }`}>
                    {promise.status}
                  </span>
                </Link>
              ))}
              {stats.recentPromises.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  No recent activity found.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
