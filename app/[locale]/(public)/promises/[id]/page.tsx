import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getLocalizedText, formatDate, convertToEmbedUrl } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

async function getPromise(id: string) {
  const promise = await prisma.promise.findUnique({
    where: { id },
    include: {
      politician: {
        include: {
          party: {
            select: { id: true, name: true, slug: true, color: true, logoUrl: true },
          },
        },
      },
      category: true,
      sources: true,
      evidence: true,
    },
  });

  return promise;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, locale } = await params;
  const promise = await getPromise(id);

  if (!promise) {
    return { title: "Promise Not Found" };
  }

  const text = getLocalizedText(promise.text as any, locale);

  return {
    title: text.substring(0, 60) + (text.length > 60 ? "..." : ""),
    description: text,
  };
}

export default async function PromiseDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("promises");
  const tCommon = await getTranslations("common");
  const promise = await getPromise(id);

  if (!promise) {
    notFound();
  }

  const promiseText = getLocalizedText(promise.text as any, locale);
  const explanation = getLocalizedText(promise.explanation as any, locale);
  const categoryName = getLocalizedText(promise.category.name as any, locale);
  const partyName = getLocalizedText(promise.politician.party.name as any, locale);
  const bio = getLocalizedText(promise.politician.bio as any, locale);

  return (
    <div className="py-12">
      <div className="max-w-5xl mx-auto px-6">
        {/* Back Button */}
        <Link
          href="/promises"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white
            transition-colors font-medium mb-12"
        >
          ← {tCommon("back")}
        </Link>

        {/* Politician Header Card */}
        <div className="glass-card rounded-2xl p-10 mb-12">
          <div className="flex items-start gap-8 flex-col md:flex-row">
            {promise.politician.imageUrl ? (
              <Image
                src={promise.politician.imageUrl}
                alt={promise.politician.name}
                width={96}
                height={96}
                className="w-24 h-24 rounded-full border-3 border-white/40 object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-24 h-24 rounded-full border-3 border-white/40
                bg-white/10 flex items-center justify-center flex-shrink-0">
                <span className="text-3xl text-white/60">
                  {promise.politician.name.charAt(0)}
                </span>
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
                {promise.politician.name}
              </h1>
              <p className="text-xl text-gray-300 mb-4">{partyName}</p>
              {bio && (
                <p className="text-gray-400 leading-relaxed">{bio}</p>
              )}
            </div>
          </div>
        </div>

        {/* Main Promise Text */}
        <section className="mb-16">
          <p className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight">
            {promiseText}
          </p>
        </section>

        {/* Status Card */}
        <div className="glass-card rounded-2xl p-10 mb-12">
          <div className="flex items-center justify-between flex-col md:flex-row gap-8">
            <div className="flex-1">
              <p className="text-sm text-gray-400 uppercase tracking-widest mb-3">
                Status
              </p>
              <StatusBadge status={promise.status} size="lg" />
            </div>

            <div className="flex-1">
              <p className="text-sm text-gray-400 uppercase tracking-widest mb-3">
                {t("promiseDate")}
              </p>
              <p className="text-2xl font-bold text-white">
                {formatDate(promise.dateOfPromise, locale)}
              </p>
            </div>

            <div className="flex-1">
              <p className="text-sm text-gray-400 uppercase tracking-widest mb-3">
                Category
              </p>
              <p className="text-xl font-bold text-white">{categoryName}</p>
            </div>
          </div>
        </div>

        {/* Source Section */}
        {promise.sources.length > 0 && (
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-6">{t("source")}</h2>
            <div className="space-y-4">
              {promise.sources.map((source) => (
                <div key={source.id} className="glass-card rounded-2xl p-8">
                  {source.type === "VIDEO" && (
                    <div className="aspect-video rounded-lg overflow-hidden bg-black/50 mb-4">
                      <iframe
                        src={convertToEmbedUrl(source.url)}
                        className="w-full h-full"
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      />
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-400 uppercase tracking-widest mb-2">
                      {source.type}
                    </p>
                    {source.title && (
                      <p className="text-xl text-gray-200 mb-4">
                        {getLocalizedText(source.title as any, locale)}
                      </p>
                    )}
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-lg
                        bg-gradient-to-r from-blue-500 to-blue-600
                        text-white font-semibold hover:shadow-lg transition-all"
                    >
                      View Source ↗
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Explanation Section */}
        {explanation && (
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-6">
              {t("explanation")}
            </h2>
            <div className="glass-card rounded-2xl p-8">
              <p className="text-xl text-gray-200 leading-relaxed">{explanation}</p>
            </div>
          </section>
        )}

        {/* Evidence Section */}
        {promise.evidence.length > 0 && (
          <section>
            <h2 className="text-3xl font-bold text-white mb-6">{t("evidence")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {promise.evidence.map((ev) => (
                <div key={ev.id} className="glass-card rounded-2xl p-6">
                  <p className="text-sm text-gray-400 uppercase mb-2">{ev.type}</p>
                  {ev.description && (
                    <p className="text-white mb-4">
                      {getLocalizedText(ev.description as any, locale)}
                    </p>
                  )}
                  <a
                    href={ev.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline"
                  >
                    View Evidence ↗
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
