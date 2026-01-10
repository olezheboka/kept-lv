import { getTranslations, setRequestLocale } from "next-intl/server";
import { PoliticianCard } from "@/components/ui/PoliticianCard";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

async function getPoliticians() {
  const politicians = await prisma.politician.findMany({
    include: {
      party: {
        select: { id: true, name: true, slug: true, color: true, logoUrl: true },
      },
      promises: {
        select: { id: true, text: true, status: true, dateOfPromise: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return politicians;
}

export default async function PoliticiansPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("politicians");
  const politicians = await getPoliticians();

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

        {/* Politicians Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {politicians.map((politician) => (
            <PoliticianCard key={politician.id} politician={politician as any} />
          ))}
        </div>

        {politicians.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-xl">No politicians yet. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
}
