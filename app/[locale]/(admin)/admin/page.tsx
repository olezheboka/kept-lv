import { getTranslations, setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

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

export default async function AdminDashboard({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("admin");
  const stats = await getDashboardStats();

  return (
    <div>
      <h1 className="text-4xl font-black text-white mb-8">{t("dashboard")}</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="glass-card rounded-2xl p-6">
          <p className="text-sm text-gray-400 uppercase tracking-wide mb-2">
            {t("stats.totalPromises")}
          </p>
          <p className="text-4xl font-black text-white">{stats.totalPromises}</p>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <p className="text-sm text-gray-400 uppercase tracking-wide mb-2">
            {t("stats.totalPoliticians")}
          </p>
          <p className="text-4xl font-black text-white">{stats.totalPoliticians}</p>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <p className="text-sm text-gray-400 uppercase tracking-wide mb-2">
            {t("stats.totalParties")}
          </p>
          <p className="text-4xl font-black text-white">{stats.totalParties}</p>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <p className="text-sm text-gray-400 uppercase tracking-wide mb-2">
            {t("stats.keptRate")}
          </p>
          <p className="text-4xl font-black text-emerald-400">{stats.keptRate}%</p>
        </div>
      </div>

      {/* Promise Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="glass-card rounded-2xl p-6 text-center">
          <p className="text-3xl font-black text-emerald-400 mb-2">{stats.keptPromises}</p>
          <p className="text-gray-400">Kept</p>
        </div>
        <div className="glass-card rounded-2xl p-6 text-center">
          <p className="text-3xl font-black text-rose-400 mb-2">{stats.notKeptPromises}</p>
          <p className="text-gray-400">Not Kept</p>
        </div>
        <div className="glass-card rounded-2xl p-6 text-center">
          <p className="text-3xl font-black text-amber-400 mb-2">{stats.inProgressPromises}</p>
          <p className="text-gray-400">In Progress</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Link href="/admin/promises/new" className="glass-card rounded-2xl p-6 hover:bg-white/10 transition-all">
          <span className="text-3xl mb-2 block">📜</span>
          <p className="text-white font-bold">{t("addNew")} Promise</p>
        </Link>
        <Link href="/admin/politicians/new" className="glass-card rounded-2xl p-6 hover:bg-white/10 transition-all">
          <span className="text-3xl mb-2 block">👤</span>
          <p className="text-white font-bold">{t("addNew")} Politician</p>
        </Link>
        <Link href="/admin/parties/new" className="glass-card rounded-2xl p-6 hover:bg-white/10 transition-all">
          <span className="text-3xl mb-2 block">🏛️</span>
          <p className="text-white font-bold">{t("addNew")} Party</p>
        </Link>
        <Link href="/admin/categories/new" className="glass-card rounded-2xl p-6 hover:bg-white/10 transition-all">
          <span className="text-3xl mb-2 block">🏷️</span>
          <p className="text-white font-bold">{t("addNew")} Category</p>
        </Link>
      </div>

      {/* Recent Promises */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Recent Promises</h2>
        <div className="space-y-4">
          {stats.recentPromises.map((promise) => (
            <Link
              key={promise.id}
              href={`/admin/promises/${promise.id}`}
              className="block p-4 rounded-lg hover:bg-white/10 transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium line-clamp-1">
                    {(promise.text as any).lv || (promise.text as any).en}
                  </p>
                  <p className="text-sm text-gray-400">
                    {promise.politician.name}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold
                  ${promise.status === "KEPT" ? "bg-emerald-500/20 text-emerald-400" :
                    promise.status === "NOT_KEPT" ? "bg-rose-500/20 text-rose-400" :
                    promise.status === "IN_PROGRESS" ? "bg-amber-500/20 text-amber-400" :
                    "bg-gray-500/20 text-gray-400"
                  }`}>
                  {promise.status}
                </span>
              </div>
            </Link>
          ))}

          {stats.recentPromises.length === 0 && (
            <p className="text-gray-400 text-center py-4">No promises yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
