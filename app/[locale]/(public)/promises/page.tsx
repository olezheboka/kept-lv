import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PromiseCard } from "@/components/ui/PromiseCard";
import { FilterBar } from "@/components/ui/FilterBar";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
import { PromiseStatus, Prisma } from "@prisma/client";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    status?: string;
    politician?: string;
    category?: string;
    party?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: string;
  }>;
};

async function getPromisesData(searchParams: Awaited<Props["searchParams"]>) {
  const { status, politician, category, party, search, dateFrom, dateTo, page = "1" } = searchParams;
  const limit = 10;
  const skip = (parseInt(page) - 1) * limit;

  const where: Prisma.PromiseWhereInput = {};

  if (status && status !== "all") {
    where.status = status as PromiseStatus;
  }

  if (politician) {
    where.politicianId = politician;
  }

  if (category) {
    where.categoryId = category;
  }

  if (party) {
    where.politician = { partyId: party };
  }

  if (dateFrom || dateTo) {
    where.dateOfPromise = {};
    if (dateFrom) where.dateOfPromise.gte = new Date(dateFrom);
    if (dateTo) where.dateOfPromise.lte = new Date(dateTo);
  }

  const [promises, total, politicians, categories, parties, statsData] = await Promise.all([
    prisma.promise.findMany({
      where,
      include: {
        politician: {
          include: {
            party: {
              select: { id: true, name: true, slug: true, color: true },
            },
          },
        },
        category: true,
        sources: true,
        evidence: true,
      },
      orderBy: { dateOfPromise: "desc" },
      skip,
      take: limit,
    }),
    prisma.promise.count({ where }),
    prisma.politician.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.category.findMany({
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    }),
    prisma.party.findMany({
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    }),
    prisma.promise.groupBy({
      by: ["status"],
      _count: true,
    }),
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
      case "KEPT": stats.kept = item._count; break;
      case "NOT_KEPT": stats.notKept = item._count; break;
      case "IN_PROGRESS": stats.inProgress = item._count; break;
      case "ABANDONED": stats.abandoned = item._count; break;
      case "PARTIAL": stats.partial = item._count; break;
    }
  });

  return {
    promises,
    total,
    politicians,
    categories,
    parties,
    stats,
    totalPages: Math.ceil(total / limit),
    currentPage: parseInt(page),
  };
}

export default async function PromisesPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const search = await searchParams;
  setRequestLocale(locale);

  const t = await getTranslations("promises");
  const data = await getPromisesData(search);

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4">
            {t("title")}
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </div>

        {/* Filter Bar */}
        <Suspense fallback={<div className="h-48 glass-card rounded-2xl animate-pulse" />}>
          <FilterBar
            politicians={data.politicians}
            categories={data.categories as any}
            parties={data.parties as any}
            stats={data.stats}
          />
        </Suspense>

        {/* Promise Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Suspense fallback={<div className="text-white">Loading...</div>}>
            {data.promises.map((promise) => (
              <PromiseCard key={promise.id} promise={promise as any} />
            ))}
          </Suspense>
        </div>

        {data.promises.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-xl">{t("noResults")}</p>
          </div>
        )}

        {/* Pagination */}
        {data.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-12">
            {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((pageNum) => (
              <a
                key={pageNum}
                href={`?page=${pageNum}`}
                className={`px-4 py-2 rounded-lg font-medium transition-all
                  ${pageNum === data.currentPage
                    ? "bg-blue-500 text-white"
                    : "bg-white/10 text-white hover:bg-white/20"
                  }`}
              >
                {pageNum}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
