import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Users,
  FileText,
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  ArrowRight
} from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
      <div className="p-8 text-center text-red-500 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900">
        <h2 className="text-xl font-bold mb-2">Dashboard Error</h2>
        <p className="font-mono text-sm max-w-2xl mx-auto opacity-75">
          {error instanceof Error ? error.message : "Unknown error"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Overview of the Solījums.lv platform data and activity."
        breadcrumbs={[{ label: "Overview" }]}
      />

      {/* Main Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Promises</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPromises}</div>
            <p className="text-xs text-muted-foreground">
              Across all politicians
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Politicians</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPoliticians}</div>
            <p className="text-xs text-muted-foreground">
              Active and inactive
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Parties</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalParties}</div>
            <p className="text-xs text-muted-foreground">
              Total registered parties
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kept Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.keptRate}%</div>
            <p className="text-xs text-muted-foreground">
              Success rate
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">Recent Promises</h2>
            <Link href="/admin/promises">
              <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
                View All <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
            <div className="divide-y divide-border">
              {stats.recentPromises.map((promise) => (
                <Link
                  key={promise.id}
                  href={`/admin/promises/${promise.id}`}
                  className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors group"
                >
                  <div className="min-w-0 pr-4">
                    <p className="font-medium text-sm text-foreground truncate group-hover:text-primary transition-colors">
                      {promise.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                      <span className="font-medium text-foreground/80">{promise.politician.name}</span>
                      <span className="text-border">•</span>
                      <span>{(promise.category as any)?.name || 'Uncategorized'}</span>
                    </p>
                  </div>
                  <div className={cn(
                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap",
                    promise.status === "KEPT" ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/50" :
                      promise.status === "NOT_KEPT" ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/50" :
                        promise.status === "IN_PROGRESS" ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/50" :
                          promise.status === "PARTIAL" ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/50" :
                            "bg-zinc-50 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700"
                  )}>
                    {promise.status}
                  </div>
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

        {/* Quick Actions & Status Breakdown */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold tracking-tight">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-3">
              <Link href="/admin/promises/new">
                <Button variant="outline" className="w-full justify-start h-10 px-4 gap-3 bg-background hover:bg-muted/50 border-dashed">
                  <Plus className="w-4 h-4 text-primary" />
                  New Promise
                </Button>
              </Link>
              <Link href="/admin/politicians/new">
                <Button variant="outline" className="w-full justify-start h-10 px-4 gap-3 bg-background hover:bg-muted/50 border-dashed">
                  <Plus className="w-4 h-4" />
                  New Politician
                </Button>
              </Link>
              <Link href="/admin/parties/new">
                <Button variant="outline" className="w-full justify-start h-10 px-4 gap-3 bg-background hover:bg-muted/50 border-dashed">
                  <Plus className="w-4 h-4" />
                  New Party
                </Button>
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold tracking-tight">Status Overview</h2>
            <Card>
              <CardContent className="p-0 divide-y divide-border">
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-medium">Kept</span>
                  </div>
                  <span className="text-sm font-bold">{stats.keptPromises}</span>
                </div>
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <XCircle className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-medium">Not Kept</span>
                  </div>
                  <span className="text-sm font-bold">{stats.notKeptPromises}</span>
                </div>
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">In Progress</span>
                  </div>
                  <span className="text-sm font-bold">{stats.inProgressPromises}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
