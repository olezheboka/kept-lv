import { getTranslations, setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { DeleteButton } from "@/components/ui/DeleteButton";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

async function getPromises() {
  return prisma.promise.findMany({
    include: {
      politician: { select: { name: true } },
      category: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function AdminPromisesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("admin");
  const promises = await getPromises();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-black text-white">{t("managePromises")}</h1>
        <Link
          href="/admin/promises/new"
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
                Promise
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase">
                Politician
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase">
                Status
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase">
                Category
              </th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {promises.map((promise) => (
              <tr key={promise.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4">
                  <p className="text-white font-medium line-clamp-2 max-w-md">
                    {(promise.title as any).lv || (promise.title as any).en}
                  </p>
                </td>
                <td className="px-6 py-4 text-gray-300">
                  {promise.politician.name}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold
                    ${promise.status === "KEPT" ? "bg-emerald-500/20 text-emerald-400" :
                      promise.status === "NOT_KEPT" ? "bg-rose-500/20 text-rose-400" :
                        promise.status === "IN_PROGRESS" ? "bg-amber-500/20 text-amber-400" :
                          promise.status === "PARTIAL" ? "bg-violet-500/20 text-violet-400" :
                            "bg-gray-500/20 text-gray-400"
                    }`}>
                    {promise.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-300">
                  {(promise.category.name as any).lv || (promise.category.name as any).en}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/promises/${promise.id}`}
                      className="px-3 py-1.5 rounded-lg bg-white/10 text-white
                        hover:bg-white/20 transition-all text-sm font-medium"
                    >
                      Edit
                    </Link>
                    <DeleteButton id={promise.id} type="promises" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {promises.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No promises yet. Create your first one!</p>
          </div>
        )}
      </div>
    </div>
  );
}
