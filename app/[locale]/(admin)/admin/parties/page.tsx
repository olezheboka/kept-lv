import { getTranslations, setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { DeleteButton } from "@/components/ui/DeleteButton";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

async function getParties() {
  return prisma.party.findMany({
    include: {
      _count: { select: { politicians: true } },
    },
    orderBy: { name: "asc" },
  });
}

export default async function AdminPartiesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("admin");
  const parties = await getParties();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-black text-white">{t("manageParties")}</h1>
        <Link
          href="/admin/parties/new"
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
                Color
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase">
                Politicians
              </th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {parties.map((party) => (
              <tr key={party.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 text-white font-medium">
                  {(party.name as any).lv || (party.name as any).en}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: party.color }}
                    />
                    <span className="text-gray-400 text-sm">{party.color}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-300">
                  {party._count.politicians}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/parties/${party.id}`}
                      className="px-3 py-1.5 rounded-lg bg-white/10 text-white
                        hover:bg-white/20 transition-all text-sm font-medium"
                    >
                      Edit
                    </Link>
                    <DeleteButton id={party.id} type="parties" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {parties.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No parties yet. Create your first one!</p>
          </div>
        )}
      </div>
    </div>
  );
}
