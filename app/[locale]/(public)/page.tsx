import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { HeroSection } from "@/components/sections/HeroSection";
import { StatsSection } from "@/components/sections/StatsSection";
import { PromiseCard } from "@/components/ui/PromiseCard";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
import Link from "next/link";

type Props = {
  params: Promise<{ locale: string }>;
};

async function getHomeData() {
  const [statsData, recentPromises, politicianCount, partyCount] = await Promise.all([
    prisma.promise.groupBy({
      by: ["status"],
      _count: true,
    }),
    prisma.promise.findMany({
      take: 3,
      orderBy: { createdAt: "desc" },
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
        evidence: true,
      },
    }),
    prisma.politician.count(),
    prisma.party.count(),
  ]);

  const stats = {
    total: 0,
    kept: 0,
    notKept: 0,
    inProgress: 0,
    abandoned: 0,
    partial: 0,
  };

  statsData.forEach((item) => {
    stats.total += item._count;
    switch (item.status) {
      case "KEPT":
        stats.kept = item._count;
        break;
      case "NOT_KEPT":
        stats.notKept = item._count;
        break;
      case "IN_PROGRESS":
        stats.inProgress = item._count;
        break;
      case "ABANDONED":
        stats.abandoned = item._count;
        break;
      case "PARTIAL":
        stats.partial = item._count;
        break;
    }
  });

  return { stats, recentPromises, politicianCount, partyCount };
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("home");
  const { stats, recentPromises, politicianCount, partyCount } = await getHomeData();

  return (
    <div>
      {/* Hero Section */}
      <HeroSection
        stats={{
          total: stats.total,
          kept: stats.kept,
          notKept: stats.notKept,
        }}
      />

      {/* Stats Section */}
      <StatsSection
        stats={stats}
        politicians={politicianCount}
        parties={partyCount}
      />

      {/* Recent Promises */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              {t("featuredTitle")}
            </h2>
            <Link
              href="/promises"
              className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
            >
              {t("viewAllPromises")} →
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <Suspense fallback={<div className="text-white">Loading...</div>}>
              {recentPromises.map((promise) => (
                <PromiseCard key={promise.id} promise={promise as any} />
              ))}
            </Suspense>
          </div>

          {recentPromises.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No promises yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
