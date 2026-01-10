import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PromiseCard } from "@/components/ui/PromiseCard";
import { getLocalizedText, statusConfig } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

async function getPolitician(slug: string) {
  const politician = await prisma.politician.findUnique({
    where: { slug },
    include: {
      party: {
        select: { id: true, name: true, slug: true, color: true, logoUrl: true },
      },
      promises: {
        include: {
          category: true,
          sources: true,
          evidence: true,
          politician: {
            include: {
              party: {
                select: { id: true, name: true, slug: true, color: true },
              },
            },
          },
        },
        orderBy: { dateOfPromise: "desc" },
      },
    },
  });

  return politician;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const politician = await getPolitician(slug);

  if (!politician) {
    return { title: "Politician Not Found" };
  }

  return {
    title: politician.name,
    description: `Track promises made by ${politician.name}`,
  };
}

export default async function PoliticianProfilePage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("politicians");
  const tCommon = await getTranslations("common");
  const tStatus = await getTranslations("status");
  const politician = await getPolitician(slug);

  if (!politician) {
    notFound();
  }

  const partyName = getLocalizedText(politician.party.name as any, locale);
  const bio = getLocalizedText(politician.bio as any, locale);

  // Calculate stats
  const stats = {
    total: politician.promises.length,
    kept: politician.promises.filter((p) => p.status === "KEPT").length,
    notKept: politician.promises.filter((p) => p.status === "NOT_KEPT").length,
    inProgress: politician.promises.filter((p) => p.status === "IN_PROGRESS").length,
    abandoned: politician.promises.filter((p) => p.status === "ABANDONED").length,
    partial: politician.promises.filter((p) => p.status === "PARTIAL").length,
  };

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Back Button */}
        <Link
          href="/politicians"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white
            transition-colors font-medium mb-12"
        >
          ← {tCommon("back")}
        </Link>

        {/* Profile Header */}
        <div className="glass-card rounded-2xl p-10 mb-12">
          {/* Party color accent */}
          <div
            className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
            style={{ backgroundColor: politician.party.color }}
          />

          <div className="flex items-start gap-8 flex-col md:flex-row">
            {politician.imageUrl ? (
              <Image
                src={politician.imageUrl}
                alt={politician.name}
                width={160}
                height={160}
                className="w-40 h-40 rounded-full border-4 border-white/40 object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-40 h-40 rounded-full border-4 border-white/40
                bg-white/10 flex items-center justify-center flex-shrink-0">
                <span className="text-5xl text-white/60">
                  {politician.name.charAt(0)}
                </span>
              </div>
            )}

            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
                {politician.name}
              </h1>
              <p className="text-xl text-gray-300 mb-4">
                <span className="font-medium">{t("party")}:</span> {partyName}
              </p>
              {bio && (
                <>
                  <h3 className="text-lg font-semibold text-gray-400 mb-2">
                    {t("biography")}
                  </h3>
                  <p className="text-gray-300 leading-relaxed max-w-3xl">{bio}</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Promise Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          <div className="glass-card rounded-xl p-4 text-center">
            <p className="text-3xl font-black text-white">{stats.total}</p>
            <p className="text-sm text-gray-400">Total</p>
          </div>
          <div className="glass-card rounded-xl p-4 text-center">
            <p className="text-3xl font-black text-emerald-400">{stats.kept}</p>
            <p className="text-sm text-gray-400">{tStatus("kept")}</p>
          </div>
          <div className="glass-card rounded-xl p-4 text-center">
            <p className="text-3xl font-black text-rose-400">{stats.notKept}</p>
            <p className="text-sm text-gray-400">{tStatus("notKept")}</p>
          </div>
          <div className="glass-card rounded-xl p-4 text-center">
            <p className="text-3xl font-black text-amber-400">{stats.inProgress}</p>
            <p className="text-sm text-gray-400">{tStatus("inProgress")}</p>
          </div>
          <div className="glass-card rounded-xl p-4 text-center">
            <p className="text-3xl font-black text-violet-400">{stats.partial}</p>
            <p className="text-sm text-gray-400">{tStatus("partial")}</p>
          </div>
          <div className="glass-card rounded-xl p-4 text-center">
            <p className="text-3xl font-black text-slate-400">{stats.abandoned}</p>
            <p className="text-sm text-gray-400">{tStatus("abandoned")}</p>
          </div>
        </div>

        {/* Promises */}
        <section>
          <h2 className="text-3xl font-bold text-white mb-8">{t("promiseHistory")}</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {politician.promises.map((promise) => (
              <PromiseCard key={promise.id} promise={promise as any} />
            ))}
          </div>

          {politician.promises.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-400 text-xl">No promises recorded yet.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
