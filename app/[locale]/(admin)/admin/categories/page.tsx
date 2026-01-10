import { getTranslations, setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { DeleteButton } from "@/components/ui/DeleteButton";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

async function getCategories() {
  return prisma.category.findMany({
    include: {
      _count: { select: { promises: true } },
    },
    orderBy: { name: "asc" },
  });
}

export default async function AdminCategoriesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("admin");
  const categories = await getCategories();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-black text-white">{t("manageCategories")}</h1>
        <Link
          href="/admin/categories/new"
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
                Slug
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
            {categories.map((category) => (
              <tr key={category.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 text-white font-medium">
                  {(category.name as any).lv || (category.name as any).en}
                </td>
                <td className="px-6 py-4 text-gray-400">
                  {category.slug}
                </td>
                <td className="px-6 py-4 text-gray-300">
                  {category._count.promises}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/categories/${category.id}`}
                      className="px-3 py-1.5 rounded-lg bg-white/10 text-white
                        hover:bg-white/20 transition-all text-sm font-medium"
                    >
                      Edit
                    </Link>
                    <DeleteButton id={category.id} type="categories" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {categories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No categories yet. Create your first one!</p>
          </div>
        )}
      </div>
    </div>
  );
}
