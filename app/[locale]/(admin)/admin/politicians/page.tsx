import { getTranslations, setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { DeleteButton } from "@/components/ui/DeleteButton";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

async function getPoliticians() {
  return prisma.politician.findMany({
    include: {
      party: { select: { name: true, color: true } },
      _count: { select: { promises: true } },
    },
    orderBy: { name: "asc" },
  });
}

export default async function AdminPoliticiansPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("admin");
  const politicians = await getPoliticians();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-black text-white">{t("managePoliticians")}</h1>
        <Link
          href="/admin/politicians/new"
          className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600
            text-white font-bold hover:shadow-lg transition-all"
        >
          {t("addNew")}
        </Link>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-white/10">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase">
                Name
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase">
                Party
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase">
                Promises
              </th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {politicians.map((politician) => (
              <tr key={politician.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 text-white font-medium">
                  {politician.name}
                </td>
                <td className="px-6 py-4">
                  {politician.party ? (
                    <span
                      className="px-3 py-1 rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: politician.party.color }}
                    >
                      {(politician.party.name as any).lv || (politician.party.name as any).en}
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-500 text-white">
                      Independent
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-gray-300">
                  {politician._count.promises}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/politicians/${politician.id}`}
                      className="px-3 py-1.5 rounded-lg bg-white/10 text-white
                        hover:bg-white/20 transition-all text-sm font-medium"
                    >
                      Edit
                    </Link>
                    <DeleteButton id={politician.id} type="politicians" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {politicians.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No politicians yet. Create your first one!</p>
          </div>
        )}
      </div>
    </div>
  );
}
